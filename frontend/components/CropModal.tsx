"use client";

import Cropper from "react-easy-crop";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CropModal({ image, onCancel, onSave, targetSize = 256 }: any) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);

  const handleCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const createCroppedImage = async () => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    img.src = image;

    await new Promise((res) => (img.onload = res));

    const ctx = canvas.getContext("2d")!;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      targetSize,
      targetSize
    );

    const croppedImage = canvas.toDataURL("image/jpeg", 0.8);
    onSave(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-[90%] max-w-md space-y-4">

        <div className="relative w-full h-64">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}       // کراپ 1:1
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex justify-between gap-4">
          <Button variant="outline" onClick={onCancel} className="w-full">
            لغو
          </Button>
          <Button onClick={createCroppedImage} className="w-full">
            تأیید کراپ
          </Button>
        </div>

      </div>
    </div>
  );
}
