export default function CardUI({ children,className="" }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 border ${className}`}>{children}</div>
  );
}
