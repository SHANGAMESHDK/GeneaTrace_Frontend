import bpy
import numpy as np

# Load source image
src_path = r"C:\Users\sudhi\.gemini\antigravity\brain\5fb86c1e-77f8-48b0-b261-defbe649e50a\.user_uploaded\media_1793125338753_4d8088e5.png"
img = bpy.data.images.load(src_path)
w, h = img.size[0], img.size[1]
pixels = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)

# 1. First, save raw image copy
img.save_render(r"c:\Sudhir\TECHOZZ\SRM-TRP\public\s25ultra_raw.png")

# 2. Tight bounding box of subject:
# X: 350 to 615, Y: 45 to 510
# Let's add slight margin: X: 345 to 620, Y: 40 to 515
xmin, xmax = 345, 620
ymin, ymax = 40, 515

crop_w = xmax - xmin
crop_h = ymax - ymin
cropped = pixels[ymin:ymax, xmin:xmax, :].copy()

# Background color in corners
bg_color = np.array([0.855, 0.855, 0.855], dtype=np.float32)

# Distance to background
diff = np.linalg.norm(cropped[:, :, :3] - bg_color, axis=-1)

# Alpha mask generation:
# Anything with diff > 0.10 is subject, between 0.05 and 0.10 is smooth anti-aliased edge
alpha = np.clip((diff - 0.05) / 0.06, 0.0, 1.0)

# Filter out isolated background speckles outside phone/spen:
# Phone column in cropped: x roughly 60 to 265
# Spen column in cropped: x roughly 8 to 55
# Ground shadow: y < 25
for y in range(crop_h):
    for x in range(crop_w):
        # Outside phone & spen bounding zones
        if x < 6 or x > 268:
            alpha[y, x] = 0.0
        # Above phone/spen top
        if y > (crop_h - 10):
            alpha[y, x] = 0.0
        # Ground shadow softening: soft gradient under phone/spen
        if y < 15:
            alpha[y, x] *= (y / 15.0) ** 1.5

# Apply alpha
cropped[:, :, 3] = alpha

# Create new image in Blender to save transparent cutout PNG
out_img = bpy.data.images.new("s25ultra_cutout", width=crop_w, height=crop_h, alpha=True)
out_img.pixels = cropped.flatten().tolist()
out_img.filepath_raw = r"c:\Sudhir\TECHOZZ\SRM-TRP\public\s25ultra_cutout.png"
out_img.file_format = 'PNG'
out_img.save()

print(f"Saved cutout: {crop_w}x{crop_h} to public/s25ultra_cutout.png")
