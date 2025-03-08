"use client";

import CertificateCheckFeature from "../elaut/CertificateCheckFeature";

const FormCekSertifikat = () => {
  return (
    <section className="flex flex-col bg-[#EEEAEB] h-full">
      <div className="relative w-full h-full pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="pt-32  md:pt-32 ">
            <section
              id="cek-sertifikat"
              className="scroll-smooth w-full max-w-7xl mx-auto -mt-16 md:mt-6"
            >
              <CertificateCheckFeature />
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FormCekSertifikat;
