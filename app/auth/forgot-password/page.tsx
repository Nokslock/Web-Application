import EmailForm from "./actions/emailForm";

export default function ForgotPassword() {
  return (
    <>
      <div className="text-center px-5 md:px-10 lg:px-10">
        <p className="text-3xl font-bold md:text-4xl lg:text-5xl">Forgot Password</p>

        <p className="break-words py-5 text-center text-base font-thin md:text-lg lg:text-xl">
          Regain access to your simpler, more secure online experience.
          <br />
          Your digital world, protected and awaiting your return.
        </p>
      </div>
      <div className="lg:px-10 md:px-10 px-5">
        <EmailForm />
      </div>

      
    </>
  );
}
