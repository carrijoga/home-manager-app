import sys
import numpy as np
from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=20, smoothness=15):
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    
    # Distância Euclidiana em relação ao branco puro (255, 255, 255)
    dist = np.sqrt((255 - r)**2 + (255 - g)**2 + (255 - b)**2)
    
    # Transição suave de transparência (smooth edge alpha)
    alpha = np.clip((dist - tolerance) / max(smoothness, 1) * 255.0, 0, 255.0)
    arr[:,:,3] = alpha
    
    result = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    result.save(output_path, 'PNG')
    print(f"Fundo removido com sucesso: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python remove_bg.py <input_image> <output_image>")
        sys.exit(1)
    
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    remove_white_bg(in_file, out_file)
