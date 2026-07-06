import AuthCard from "../../components/auth/AuthCard";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard title="welcome back" subtitle="login to continue shopping">
      <LoginForm />
    </AuthCard>
  );
}