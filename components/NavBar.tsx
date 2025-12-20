import HomeLogo from "@/components/HomeLogo";
import NavLinks from "@/components/NavLinks";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function NavBar() {
  return (
    <>
      <nav className="absolute inset-x-0 top-0">
        <div className="conatiner mx-auto lg:px-20 py-5">
          <div className="grid grid-cols-8 ">
            <div className="col-span-2">
              <HomeLogo />
            </div>
            <div className="col-span-4">
              <NavLinks />
            </div>
            <div className="col-span-2">
              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                    
                </div>
                <div>
                  <Link href="/auth/login">
                    <AuthButton
                      variant="primary"
                      type="button"
                    >
                      Login
                    </AuthButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
