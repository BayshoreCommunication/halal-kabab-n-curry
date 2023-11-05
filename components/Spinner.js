import React from "react";
import SpinnerImage1 from "../public/images/spinner-image1.png";
import SpinnerImage2 from "../public/images/spinner-image2.png";
import SpinnerImage3 from "../public/images/spinner-image3.png";
import SpinnerImage4 from "../public/images/spinner-image4.png";
import Image from "next/image";
function Spinner() {
  return (
    <div className="spinner">
      <Image
        src={SpinnerImage1}
        height={80}
        width={80}
        className="pizza-part pizza-part-1"
        alt="Spinner Image"
      />
      <Image
        src={SpinnerImage2}
        height={80}
        width={80}
        className="pizza-part pizza-part-2"
        alt="Spinner Image"
      />
      <Image
        src={SpinnerImage3}
        height={80}
        width={80}
        className="pizza-part pizza-part-3"
        alt="Spinner Image"
      />
      <Image
        src={SpinnerImage4}
        height={80}
        width={80}
        className="pizza-part pizza-part-4"
        alt="Spinner Image"
      />
    </div>
  );
}

export default Spinner;
