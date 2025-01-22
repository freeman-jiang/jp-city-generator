import numpy as np
import onnx
import onnxruntime

from train_full import block_size, itos, stoi

# Create ONNX Runtime session
session = onnxruntime.InferenceSession("jp_cities_model.onnx", providers=['CPUExecutionProvider'])
input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name

def generate_name():
    context = [0] * block_size
    out = []
    
    while True:
        # Run inference
        input_data = np.array([context], dtype=np.int64)
        logits = session.run([output_name], {input_name: input_data})[0]
        
        # Get probabilities and sample
        probs = np.exp(logits) / np.sum(np.exp(logits))
        ix = np.random.choice(len(probs[0]), p=probs[0])
        
        # Update context and track output
        context = context[1:] + [ix]
        out.append(ix)
        
        if ix == 0:
            break
            
    return ''.join(itos[i] for i in out)

for i in range(20):
  print(generate_name())