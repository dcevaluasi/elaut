"use client";

import Footer from "../ui/footer";
import Newsletter from "../newsletter";

function FormCekSertifikat() {
  return (
    <>
      <section className="flex flex-col bg-[#EEEAEB] h-full">
        <div className="relative w-full h-full pb-10">
          <div className="max-w-6xl mx-auto">
            <div className="pt-32  md:pt-32 ">
              <Newsletter />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>

  );
}

export default FormCekSertifikat;
