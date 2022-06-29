import Link from "next/link";

const ReturnToHome = () => (
  <div className="text-center mt-3 text-gray-800">
    <Link href="/">
      <a className="underline cursor-pointer">👈 return to home</a>
    </Link>
  </div>
);

export default ReturnToHome;
