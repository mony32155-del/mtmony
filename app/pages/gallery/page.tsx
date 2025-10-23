import Card from "@/app/components/Card";
import React from "react";

const Gallery = () => {
  return (
    <div className=" flex">
      <Card
        image="/00.jpg"
        color="bg-gray-400"
        title="Gallery"
        description="Gallery Page"
      >
        <p>Image</p>
      </Card>
      <Card
        image="/00.jpg"
        color="bg-gray-400"
        title="Gallery"
        description="Gallery Page"
      >
        <p>Image</p>
      </Card>
      <Card
        image="/00.jpg"
        color="bg-gray-400"
        title="Gallery"
        description="Gallery Page"
      >
        <p>Image</p>
      </Card>
      <Card
        image="/00.jpg"
        color="bg-gray-400"
        title="Gallery"
        description="Gallery Page"
      >
        <p>Image</p>
      </Card>
    </div>
  );
};

export default Gallery;
