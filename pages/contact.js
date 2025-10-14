import dynamic from "next/dynamic";

const Contact = dynamic(() => import("../src/pages/Contact"), {
  ssr: false,
});

export default function ContactPage() {
  return <Contact />;
}


