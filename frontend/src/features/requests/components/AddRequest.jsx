import React from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddRequest() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    reset,
  } = useForm();

  const submit = (data) => {
    console.log(data);
    toast.success("Request submitted successfully!");
    reset();
    setTimeout(() => setFocus("fullName"), 0); // wait for DOM to update
  };

  return (
    <div className=" mx-auto  p-6 ">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Request</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Full Name</label>
          <input
            {...register("fullName", { required: "Full Name is required" })}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFocus("fatherName");
              }
            }}
            type="text"
            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fullName && (
            <span className="text-red-500 text-sm mt-1">
              {errors.fullName.message}
            </span>
          )}
        </div>

        {/* Father Name */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Father Name</label>
          <input
            {...register("fatherName", { required: "Father Name is required" })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFocus("occupation");
              }
            }}
            type="text"
            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.fatherName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fatherName && (
            <span className="text-red-500 text-sm mt-1">
              {errors.fatherName.message}
            </span>
          )}
        </div>

        {/* Occupation/Major/Location */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">
            Occupation / Major / Location
          </label>
          <input
            {...register("occupation", { required: "This field is required" })}
                        onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFocus("book");
              }
            }}
            type="text"
            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.occupation ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.occupation && (
            <span className="text-red-500 text-sm mt-1">
              {errors.occupation.message}
            </span>
          )}
        </div>

        {/* Book */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Book</label>
          <input
            {...register("book", { required: "Book name is required" })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFocus("submitButton");
              }
            }}
            type="text"
            className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.book ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.book && (
            <span className="text-red-500 text-sm mt-1">
              {errors.book.message}
            </span>
          )}
        </div>

        {/* Submit Button (full width in bottom row) */}
        <div className="md:col-span-2 flex justify-end">
          <button
            onFocus={handleSubmit(submit)}
            {...register("submitButton")}
            type="button"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Submit
          </button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AddRequest;
