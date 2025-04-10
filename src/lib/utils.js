import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const showAlert = (message, variant) => {
  variant === 'success' ? toast.success(message) : toast.error(message);
};

export function toBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = error => reject(error);
  });
}

export async function checkEmailExists(email) {
  try {
      const url = `${process.env.NEXT_PUBLIC_CHECK_EMAIL_API}?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=${process.env.NEXT_PUBLIC_CHECK_EMAIL_SIG}`;
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      });
      return response.ok ? (await response.json()).emailExists : false;
  } catch (error) {
      console.error("Email check error:", error);
      return false;
  }
}

export async function sendFormData(data) {
  try {
      const url = `${process.env.NEXT_PUBLIC_SEND_FORM_API}?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=${process.env.NEXT_PUBLIC_SEND_FORM_SIG}`;
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });

      if (response.ok) {
          showAlert("Successfully submitted the form.", "success");
          clearForm(); // make sure this function exists
      } else {
          showAlert(`Failed to submit: ${await response.text()}`, "danger");
      }
  } catch (error) {
      console.error("Request Failed:", error);
      showAlert(`Request failed: ${error.message}`, "danger");
  }
}

export async function sendQrCodeEmail(email) {
  try {
      const url = `${process.env.NEXT_PUBLIC_SEND_QR_API}?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=${process.env.NEXT_PUBLIC_SEND_QR_SIG}`;
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
      });

      if (response.ok) {
          console.log("QR Code email sent successfully.");
      } else {
          console.warn(`QR email failed: ${await response.text()}`);
      }
  } catch (error) {
      console.error("QR Email Error:", error);
  }
}


