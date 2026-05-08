import { FaCopy } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { useState } from "react";

export default function CopyLinkButton({ url, color="bg-yellow-400" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // Reset check icon after 2.5 seconds
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <button
    type="button"
    onClick={handleCopy}
    className={`w-8 h-8 justify-center ${color} text-white rounded flex items-center gap-2`}
    >
      {copied ? (
        <FaCheck/>
      ) : (
        <FaCopy/>
      )}
    </button>
  );
}
