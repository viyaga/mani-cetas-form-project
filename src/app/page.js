// Updated form with all 18 fields and Framer Motion animation (replacing GSAP)

'use client';

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string(),
  certificateNo: z.string().min(1, "Certificate No is required"),
  degree: z.string(),
  yop: z.string(),
  fresher: z.string(),
  relevantExp: z.string(),
  otherExp: z.string(),
  expertise: z.string(),
  currentCTC: z.string(),
  expectedCTC: z.string(),
  notice: z.string(),
  noticeDays: z.string(),
  noticeServingTill: z.string(),
  knownThrough: z.string(),
  resume: z
    .any()
    .optional()
    .refine((file) => !file?.[0] || file[0].size <= 2 * 1024 * 1024, "Resume must be under 2MB"),
});

export default function RegisterPage() {
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const showAlert = (message, variant) => {
    if (variant === "success") toast.success(message);
    else if (variant === "danger") toast.error(message);
    else toast(message);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const onSubmit = async (data) => {
    const file = data.resume?.[0];
    const resume = file ? await toBase64(file) : null;
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, resume }),
    });
    showAlert("Form submitted!", "success");
    reset();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-tr from-black via-gray-900 to-gray-800 p-4 overflow-hidden">
      <motion.div
        id="form-container"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-md z-10 shadow-xl border border-white/10 bg-white/5 backdrop-blur p-6 rounded-xl"
      >
        <CardContent className="space-y-6">
          <div className="text-center text-white space-y-1">
            <img src="https://i.ibb.co/CpZ0F5dk/Cetas-Logo-White.png" alt="Cetas Logo" className="mx-auto w-32 mb-2" />
            <h2 className="text-xl font-bold">Cetas Walk-in Interview Registration</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} ref={formRef} className="space-y-4">
            {[
              ["name", "Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["gender", "Gender"],
              ["dob", "Date of Birth", "date"],
              ["certificateNo", "10th Certificate No"],
              ["degree", "Education Qualification"],
              ["yop", "Year Of Passing"],
              ["fresher", "Fresher/Experienced"],
              ["relevantExp", "Relevant Experience (Same Domain)"],
              ["otherExp", "Other Domain Experience"],
              ["expertise", "Expertise - Functional/Technical"],
              ["currentCTC", "Current CTC (in Lakhs)"],
              ["expectedCTC", "Expected CTC (in Lakhs)"],
              ["notice", "Immediate Joiner / Notice Period"],
              ["noticeDays", "Notice Period - No. of days / months"],
              ["noticeServingTill", "Notice Period - Serving - Last Date"],
              ["knownThrough", "Known of Cetas through LinkedIn or friends"],
            ].map(([name, label, type = "text"]) => (
              <div key={name}>
                <Label htmlFor={name} className="text-white">{label}</Label>
                <Input id={name} type={type} {...register(name)} />
                {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message?.toString()}</p>}
              </div>
            ))}

            <div>
              <Label htmlFor="resume" className="text-white">Resume (PDF, Max 2MB)</Label>
              <Input id="resume" type="file" accept=".pdf" {...register("resume")} />
              {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume.message?.toString()}</p>}
            </div>

            <Button type="submit" className="w-full mt-4">Submit</Button>
          </form>
        </CardContent>
      </motion.div>
    </div>
  );
}
