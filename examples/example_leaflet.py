import io
import base64
from PIL import Image
import numpy as np
from matplotlib import cm

x = y = np.arange(-3.0, 3.0, 0.02)
X, Y = np.meshgrid(x, y)
Z1 = np.exp(-X**2 - Y**2)
Z2 = np.exp(-(X - 1)**2 - (Y - 1)**2)
Z = (Z1 - Z2) * 2

def array_to_png(Z):
    Z = np.abs(Z)
    Z /= np.max(Z)

    if Z.ndim == 2:
        image = Image.fromarray(np.uint8(255*Z), 'L')
    elif Z.ndim == 3:
        if Z.shape[2] == 4:
            image = Image.fromarray(np.uint8(255*Z), 'RGBA')
        elif Z.shape[2] == 3:
            image = Image.fromarray(np.uint8(255*Z), 'RGB')
        else:
            raise ValueError("Third dimension of array must have length 3 (RGB) or 4 (RGBA)")
    else:
        raise ValueError("Incorrect number of dimensions in array")

    byte_io = io.BytesIO()
    image.save(byte_io, format='PNG')
    byte_io.seek(0)

    base64_data = base64.b64encode(byte_io.read()).decode('ascii')
    return f"data:image/png;base64,{base64_data}"

with open('base64array_main_picture', 'w') as fh:
    fh.write(array_to_png(Z))

with open('base64array_colormap', 'w') as fh:
    fh.write(array_to_png(cm.get_cmap('viridis', 256)([np.linspace(0, 1, 256)])))
