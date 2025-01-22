import matplotlib.pyplot as plt  # for making figures
import pandas as pd
import torch
import torch.nn.functional as F
import torch.onnx
from torch import nn

cities = pd.read_csv("cities_raw.csv")["city_en"].tolist()

# build the vocabulary of characters and mappings to/from integers
chars = sorted(list(set(''.join(cities))))
stoi = {s: i+1 for i, s in enumerate(chars)}
stoi['.'] = 0 # start and finish char
itos = {i: s for s, i in stoi.items()}
vocab_size = len(itos)

def encode(s: str):
  return [stoi[c] for c in s]

def decode(ints: list[int]):
  return ''.join(itos[i] for i in ints)

from dataclasses import dataclass
from typing import Literal


@dataclass
class LearningInterval():
    lr: int
    iters: int

def train_model_full(model, schedules, eval_interval=2000):
    for i, sch in enumerate(schedules):
        print(f"SCHEDULE {i+1}/{len(schedules)}: lr={sch.lr}, iters={sch.iters}")

        # create a PyTorch optimizer
        optimizer = torch.optim.AdamW(model.parameters(), lr=sch.lr)

        for cur_iter in range(sch.iters):

            # every once in a while evaluate the loss on train and val sets
            if cur_iter % eval_interval == 0 or cur_iter == sch.iters - 1:
                losses = db.estimate_loss(model)
                print(f"iter {cur_iter + 1}/{sch.iters}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")

            # sample a batch of data
            xb, yb = db.get_batch('full')


            # evaluate the loss
            logits, loss = model(xb, yb)
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()



class DatasetManager:
    def __init__(self, train_data, val_data, block_size, batch_size):
        self.block_size = block_size
        self.batch_size = batch_size
        self.train_dataset = self._build_dataset(train_data)
        self.val_dataset = self._build_dataset(val_data)
        self.full_dataset = self._build_dataset(cities)

    def _build_dataset(self, data):
        X, Y = [], []
        for w in data:
            encoding = encode(w + '.')
            context = encode('.') * self.block_size
            for idx in encoding:
                X.append(context)
                Y.append(idx)
                context = context[1:] + [idx]
        return torch.tensor(X), torch.tensor(Y)

    def get_batch(self, split: Literal["train", "val", "full"]):
        if split == "train":
            data = self.train_dataset
        elif split == "val":
            data = self.val_dataset
        else:
            data = self.full_dataset
        ix = torch.randint(len(data[0]), (self.batch_size,))
        return data[0][ix], data[1][ix]

    def estimate_loss(self, model, eval_iters=200):
        out = {}
        model.eval()
        with torch.no_grad():
            for split in ['train', 'val']:
                losses = torch.zeros(eval_iters)
                for k in range(eval_iters):
                    X, Y = self.get_batch(split)
                    logits, loss = model(X, Y)
                    losses[k] = loss.item()
                out[split] = losses.mean()
        model.train()
        return out

# HYPERPARAMETERS
block_size = 10
batch_size = 40
n_embd = 24    # embedding dim
n_hidden = 150  # hidden layer size


cities = pd.read_csv("cities_raw.csv")["city_en"].tolist()

# Randomly split into train/val
indices = torch.randperm(len(cities))
split = int(0.9*len(cities))
train_data = [cities[i] for i in indices[:split]]
val_data = [cities[i] for i in indices[split:]]

db = DatasetManager(train_data, val_data, batch_size=batch_size, block_size=block_size)

class FinalMLP(nn.Module):

    def __init__(self):
        super().__init__()

        # input are (B,T) sequence of xs integers
        self.net = nn.Sequential(
            nn.Embedding(vocab_size, n_embd), # (B,T,n_embed)
            nn.Flatten(start_dim=1),          # (B, T*E) 
            nn.Linear(n_embd * block_size, n_hidden),  # (T*E, H)
            nn.Linear(n_hidden, vocab_size)
        )

        with torch.no_grad():
            self.net[-1].weight *= 0.1  # last layer make less confident

    # idx and targets are both (B,T) tensor of integers
    def forward(self, x, targets=None):
        # Output logits shape (B,T,C) means:
        # For EACH sequence in batch (B=32)
        #   For EACH position in sequence (T=4)
        #     Output predictions for EACH possible character (C=20)
        logits = self.net(x)
        if targets is None:
            loss = None
        else:
            # Cross entropy expects shape (N, C)
            loss = F.cross_entropy(logits, targets)

        return logits, loss

    def generate(self, number_of_cities):
        # idx is (B, T) array of indices in the current context
        for _ in range(number_of_cities):
            out = []
            context = [0] * block_size 

            while True:
                # forward pass the neural net
                logits = self.net(torch.tensor([context]))
                probs = F.softmax(logits, dim=1)
                # sample from the distribution
                ix = torch.multinomial(probs, num_samples=1).item()
                # shift the context window and track the samples
                context = context[1:] + [ix]
                out.append(ix)
                # if we sample the special '.' token, break
                if ix == 0:
                    break

            print(''.join(itos[i] for i in out))  # decode and print the generated word

    def infer(self):
        # Generate single example
        context = [0] * block_size
        out = []
        
        while True:
            logits = self.net(torch.tensor([context]))
            probs = F.softmax(logits, dim=1)
            ix = torch.multinomial(probs, num_samples=1).item()
            context = context[1:] + [ix]
            out.append(ix)
            if ix == 0:
                break
                
        return ''.join(itos[i] for i in out)

if __name__ == '__main__':
    model = FinalMLP()
    total_params = sum(p.numel() for p in model.parameters())
    print("Params: ", total_params)

    final_schedule = [
        LearningInterval(1e-2, 10_000),
        LearningInterval(1e-3, 15_000), 
        LearningInterval(1e-4, 15_000),
        LearningInterval(1e-5, 25_000),
    ]

    train_model_full(model, final_schedule)

    model.generate(40) # To show

    torch.save(model.state_dict(), "jp_cities_mlp.pt")
