import dynamic from "next/dynamic";

const Signup = dynamic(() => import("../src/pages/Signup"), {
  ssr: false,
});

export default function SignupPage() {
  return <Signup />;
}


