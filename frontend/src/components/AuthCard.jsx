export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-overlay" />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
            <div className="card auth-card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 fw-bold mb-1">{title}</h2>
                {subtitle ? <p className="text-muted mb-4">{subtitle}</p> : <div className="mb-3" />}
                {children}
              </div>
            </div>

            <div className="text-center mt-3 text-white-50 small">
              © {new Date().getFullYear()} Banka
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
