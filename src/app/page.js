'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { checkEmailExists, sendFormData, sendQrCodeEmail, showAlert, toBase64 } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  gender: z.string().min(1, 'Gender is required'),
  dob: z.string(),
  certificateNo: z.string().min(1, 'Certificate No is required'),
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
    .refine((file) => !file?.[0] || file[0].size <= 2 * 1024 * 1024, 'Resume must be under 2MB'),
});

const FORM_STORAGE_KEY = 'multiStepFormData';

export default function MultiStepRegister() {
  const [step, setStep] = useState(1);
  const [resumePreview, setResumePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const watchedFields = watch();

  const onSubmit = async (data) => {
    try {

      if (step !== steps.length) return;
      const file = data.resume?.[0];
      if (!file) {
        return;
      }

      if (file && file.type !== 'application/pdf') {
        showAlert('Please upload a PDF file', 'error');
        return;
      }

      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        showAlert('Email already exists', 'error');
        return;
      }

      const resume = file ? await toBase64(file) : null;
      await sendFormData({ ...data, resume });
      await sendQrCodeEmail(data.email);

      showAlert('Form submitted!', 'success');
      reset();
      setResumePreview(null);
      setStep(1);
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      showAlert('Failed to submit the form', 'error');
    }
  };

  const steps = [
    { title: 'Personal Info', fields: [['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['gender', 'Gender'], ['dob', 'Date of Birth', 'date']] },
    { title: 'Education & Experience', fields: [['certificateNo', '10th Certificate No'], ['degree', 'Education Qualification'], ['yop', 'Year Of Passing'], ['fresher', 'Fresher/Experienced'], ['relevantExp', 'Relevant Experience'], ['otherExp', 'Other Domain Experience']] },
    { title: 'Expertise & CTC', fields: [['expertise', 'Expertise'], ['currentCTC', 'Current CTC'], ['expectedCTC', 'Expected CTC']] },
    { title: 'Notice & Reference', fields: [['notice', 'Immediate Joiner / Notice Period'], ['noticeDays', 'Notice Period - Days'], ['noticeServingTill', 'Notice Period - Last Date'], ['knownThrough', 'Known of Cetas through']] },
    { title: 'Resume Upload', fields: [] },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumePreview(URL.createObjectURL(file));
    } else {
      setResumePreview(null);
    }
  };

  const handleNext = async () => {
    // if (step >= steps.length) return; // Prevent going out of bounds
    const currentFields = steps[step - 1].fields.map(([name]) => name);
    const valid = await trigger(currentFields);

    if (valid) setStep((s) => Math.min(s + 1, steps.length));

  };

  // 💾 Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.entries(parsed).forEach(([key, value]) => {
        if (key !== 'resume') setValue(key, value);
      });
    }
  }, [setValue]);

  // 💾 Save to localStorage on change
  useEffect(() => {
    const formData = { ...watchedFields };
    delete formData.resume; // Don't persist files
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [watchedFields]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1e2f] via-[#111113] to-[#0c0c0d] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur bg-white/5 shadow-2xl"
      >
        <CardContent className="space-y-6">
          <div className="text-center text-white">
            <img src="https://i.ibb.co/CpZ0F5dk/Cetas-Logo-White.png" alt="Cetas Logo" className="mx-auto w-28 mb-3" />
            <h2 className="text-xl font-bold tracking-wide">{steps[step - 1].title}</h2>
            <p className="text-sm text-gray-300">Step {step} of {steps.length}</p>

            {/* 🔘 Progress Bullets */}
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index + 1 < step
                    ? 'bg-green-400'
                    : index + 1 === step
                      ? 'bg-white'
                      : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {steps[step - 1].fields.map(([name, label, type = 'text']) => (
                  <div key={name}>
                    <Label htmlFor={name} className="text-white">{label}</Label>
                    <Input
                      id={name}
                      type={type}
                      placeholder={label}
                      {...register(name)}
                      className="mt-2"
                    />
                    {errors[name] && <p className="text-red-400 text-sm mt-1">{errors[name]?.message?.toString()}</p>}
                  </div>
                ))}

                {step === 5 && (
                  <div>
                    <Label htmlFor="resume" className="text-white">Resume (PDF, Max 2MB)</Label>
                    <Input id="resume" type="file" className="mt-2" accept=".pdf" {...register('resume')} onChange={handleFileChange} />
                    {resumePreview ? (
                      <embed
                        src={resumePreview}
                        type="application/pdf"
                        className="w-full h-64 mt-3 border border-white/20 rounded-lg hidden sm:block"
                      />
                    ) : (
                      <p className="text-gray-400 text-sm mt-2">No preview available</p>
                    )}
                    {errors.resume && <p className="text-red-400 text-sm mt-1">{errors.resume.message?.toString()}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4 pt-4">
              {step > 1 ? (
                <Button type="button" className="btn-outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
              ) : <div />}
              {step < steps.length ? (
                <Button type="button" onClick={handleNext} className="ml-auto btn-primary">Next</Button>
              ) : (
                <Button type="submit" className="btn-primary">Submit</Button>
              )}
            </div>
          </form>
        </CardContent>
      </motion.div>
    </div>
  );
}
