import EmailForm from "./actions/emailForm";

export default function ForgotPassword() {
  return (
    <>
      <div className="text-center px-15">
        <p className="lg:text-5xl md:text-4xl font-bold">Forgot Password</p>

        <p className="text-lg text-center break-all font-thin py-5 ">
          Regain access to your simpler, more secure online experience.
          <br />
          Your digital world, protected and awaiting your return.
        </p>
      </div>
      <div className="px-25">
        <EmailForm />
      </div>

      
    </>
  );
}
