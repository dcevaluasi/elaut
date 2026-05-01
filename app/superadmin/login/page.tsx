import FormSuperadminLogin from "@/components/auth/FormSuperadminLogin";
import Footer from "@/components/ui/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Superadmin Login - E-LAUT",
  description: "Login page for Superadmin E-LAUT",
};

export default function SuperadminLoginPage() {
  return (
    <>
      <FormSuperadminLogin />
      <Footer />
    </>
  );
}
