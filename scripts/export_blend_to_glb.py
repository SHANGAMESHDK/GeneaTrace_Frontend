"""
Headless Blender to glTF/GLB Exporter for GeneaTrace 3D Smartphone Showcase
Usage:
  & "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b "path\\to\\model.blend" -P scripts\\export_blend_to_glb.py -- public\\s25ultra.glb
"""

import sys
import bpy

def export_glb():
    # Parse output path from arguments after '--'
    argv = sys.argv
    if "--" in argv:
        output_path = argv[argv.index("--") + 1]
    else:
        output_path = "public/s25ultra.glb"

    print(f"[Blender Exporter] Exporting scene to glTF/GLB: {output_path}")

    # Select all mesh objects
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type in ['MESH', 'EMPTY']:
            obj.select_set(True)

    # Export glTF binary
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True
    )
    print(f"[Blender Exporter] Successfully exported to {output_path}")

if __name__ == "__main__":
    export_glb()

