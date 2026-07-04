# PixelForge ML Models — Phase 1 On-Device

Place TFLite FP16 GPU models here:

1. realesrgan_x2_fp16.tflite — Real-ESRGAN x2 photo, 3.7 MB
   - input [1,256,256,3] float32
   - output [1,512,512,3]
   - source: https://github.com/xinntao/Real-ESRGAN → convert to TFLite

2. realesrgan_x4_fp16.tflite — x4 variant, 6.2 MB

3. denoise_nl_unet_512.tflite — UNet denoise, 2.1 MB

4. deblur_ridnet.tflite — RIDNet motion deblur, 4.5 MB

5. gfpgan_1_4_mobile.tflite — GFPGAN face restore mobile, 16 MB INT8

6. u2netp_320.tflite — U²Net portrait matting 320px, 4.7 MB

7. mediapipe_selfie_segmentation.tflite — MediaPipe, 1.2 MB (bundled via tasks-vision)

8. portrait_relight_256.tflite — relight LUT, 2.8 MB

9. deoldify_mobile.tflite — AI colorize, 12 MB

10. superres_diffusion_tiny.tflite — optional cloud fallback

All models use GPU delegate + NNAPI fallback.
If model missing, RenderEngine gracefully falls back to CPU / bicubic.

Download script:
```
./scripts/download_models.sh
```

Total install size ~52 MB models + 33 MB app = ~85 MB APK (split ABI drops to 58 MB).
