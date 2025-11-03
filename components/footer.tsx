export default function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto w-11/12 md:w-4/5">
        <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-black font-bold">⚡</span>
                </div>
                <span className="text-white font-semibold text-xl">Unify</span>
              </div>
              <p className="text-white/70 mt-4 leading-relaxed">
                One inbox for every conversation. Unify brings SMS, email, and social into a single, powerful workspace.
              </p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Features</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Pricing</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Integrations</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">About</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Blog</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Careers</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Docs</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">API</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Status</a></li>
                <li><a className="text-white/70 hover:text-white transition-colors" href="#">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">© {new Date().getFullYear()} Unify. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy</a>
              <span className="text-white/20">|</span>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Terms</a>
              <span className="text-white/20">|</span>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


