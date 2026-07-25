import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="create your account"
      subtitle="join for faster checkout and order tracking"
    >
      <RegisterForm />
    </AuthCard>
  );
}