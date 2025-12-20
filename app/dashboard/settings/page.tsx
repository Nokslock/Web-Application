import { FaGoogle , FaFacebook , FaApple } from "react-icons/fa";

export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 pb-10">Settings</h1>

      <div className="grid grid-cols-3 gap-10">
        <div className="card">
          <div className="grid grid-cols-3 pb-5">
            <div className="col-span-2">
              <p className="text-gray-600 font-bold text-xl">
                Personal Information
              </p>
            </div>
            <div className="text-end">edit</div>
          </div>

          <div className="text-center p-5 mb-5 border border-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto">
            <input type="image" />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Full Name
            </label>
            <input
              disabled
              type="email"
              placeholder="James Olatunde"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Email
            </label>
            <input
              disabled
              type="email"
              placeholder="jamesolatunji@outlook.com"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Password
            </label>
            <input
              disabled
              type="pssword"
              placeholder="Your Email"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Phone Number
            </label>
            <input
              disabled
              type="pssword"
              placeholder="Your Email"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>
        </div>

        <div className="card">
          <div className="grid grid-cols-2 pb-5">
            <div>
              <p className="text-gray-600 font-bold text-xl">Next of Kin</p>
            </div>
            <div className="text-end">edit</div>
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Full Name
            </label>
            <input
              disabled
              type="email"
              placeholder="Samuel Olatunde"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Email
            </label>
            <input
              disabled
              type="email"
              placeholder="samuelolatunji@outlook.com"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Alternative Email
            </label>
            <input
              disabled
              type="email"
              placeholder="samuel.A.olatunji@outlook.com"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Phone Number
            </label>
            <input
              disabled
              type="Number"
              placeholder="Your Email"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              National Identification Number (NIN)
            </label>
            <input
              disabled
              type="Number"
              placeholder="37482910465"
              className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
            />
          </div>
        </div>

        <div className="card">
          <div className="grid grid-cols-2 pb-5">
            <div>
              <p className="text-gray-600 font-bold text-xl">
                Third Party Contact
              </p>
            </div>
            <div className="text-end">edit</div>
          </div>
          <div className="mb-5 p-4 rounded-md border border-gray-200">
            <div className="w-full grid grid-cols-5">
                <div className="flex col-span-4 text-start">
                    <FaGoogle /> Google
                </div>
                <div className="text-end cols-1">
                    Unlink
                </div>
            </div>
          </div>

          <div className="mb-5 p-4 rounded-md border border-gray-200">
           <div className="w-full grid grid-cols-5">
                <div className="flex col-span-4 text-start">
                    <FaApple /> Facebook
                </div>
                <div className="text-end cols-1">
                    Unlink
                </div>
            </div>
          </div>

          <div className="flex p-4 rounded-md border border-gray-200">
           <div className="w-full grid grid-cols-5">
                <div className="flex col-span-4 text-start">
                    <FaFacebook /> Facebook
                </div>
                <div className="text-end cols-1">
                    Unlink
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
