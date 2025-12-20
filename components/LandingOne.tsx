import Image from "next/image";
import Block from "@/public/block.png";
import landingOneImage from "../public/demo-img.png";

export default function LandingOne() {
  return (
    <>
      <div className="conatiner mx-auto text-center lg:px-50 md:px-20 py-10 text-center">
        <p className="subscript font-bold pb-5">More Security</p>
        <p className="lg:text-7xl md:text-5xl text-2xl font-bold pb-5">
          Take Full Control of Your <span>Digital Security</span>
        </p>
        <p className="text-2xl font-base ">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet
          accumsan enim. Nulla facilisi. Vestibulum.
        </p>
      </div>

      <div className="w-full mx-auto">
        <Image
          src={landingOneImage}
          alt="Landing One Image"
          className="img-fluid"
        />
      </div>
      <div className="section mx-auto mt-20">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 text-center">
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
        </div>
      </div>

      <div className="conatiner mx-auto text-center lg:px-50 md:px-20 py-10 text-center">
        <p className="subscript font-bold pb-5">More Security</p>
        <p className="lg:text-7xl md:text-5xl font-bold pb-5">
          Take Full Control of Your <span>Digital Security</span>
        </p>
        <p className="text-2xl font-base ">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet
          accumsan enim. Nulla facilisi. Vestibulum.
        </p>
      </div>

      <div className="container mx-auto px-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 text-center">
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
          <div><Image src={Block} alt="default"/></div>
        </div>
      </div>

      <div className="w-screen lg:h-screen md:max-h-3/4 max-h-1/2 mx-auto lg:px-50 lg:pt-53 lg:pb-20 md:px-20 md:py-10 px-10 py-5 bottom-banner mt-10">
            <div className="grid grid-cols-2">
          <div className="self-center">
            <p className="lg:text-6xl md:text-2xl text-lg text-white font-black lg:pb-10 md:pb-5">
              Take Full Control of your Digital Security
            </p>
            <p className="lg:text-2xl md:text-xl text-base text-white font-base lg:pb-10 md:pb-5">
              Log in to a simpler, more secure online experience.
              <br /> Your digital world, protected and organized.
            </p>
            </div>
          </div>
      </div>
    </>
  );
}

