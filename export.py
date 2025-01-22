import matplotlib.pyplot as plt  # for making figures
import pandas as pd
import torch
import torch.nn.functional as F
import torch.onnx
from torch import nn

from train_full import FinalMLP, block_size

device = torch.device('cpu')
model = FinalMLP()
model.load_state_dict(torch.load("jp_cities_mlp.pt", map_location=device, weights_only=True))

# Set the model to evaluation mode
model.eval()
model.generate(15)


# HYPERPARAMETERS
block_size = 10

dummy_input = torch.zeros(1, block_size, dtype=torch.long)  # batch_size=1, sequence_length=10

# Export the model
torch.onnx.export(model,               # model being run
                 dummy_input,          # model input (or a tuple for multiple inputs)
                 "jp_cities_model.onnx",  # where to save the model
                 export_params=True,   # store the trained parameter weights inside the model file
                 opset_version=12,     # the ONNX version to export the model to
                 do_constant_folding=True,  # whether to execute constant folding for optimization
                 input_names = ['input'],   # the model's input names
                 output_names = ['output'], # the model's output names
)

