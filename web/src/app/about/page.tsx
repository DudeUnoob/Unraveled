"use client";

import Link from "next/link";

const ASSETS = {
  bgPattern: "https://www.figma.com/api/mcp/asset/f9d325e2-abfa-4348-b32f-54f86fa68683",
  wavePlaidBottom: "https://www.figma.com/api/mcp/asset/4cc34560-1c2d-4c49-8eda-1ed034b24ffa",
  iconPinkDecay: "https://www.figma.com/api/mcp/asset/083450ac-072f-4c67-996e-4d858a2cb5e2",
  bgDenim: "https://www.figma.com/api/mcp/asset/a6e98a03-9d4f-492d-b8f1-79df13301608",
  waveDenimTop: "https://www.figma.com/api/mcp/asset/fd972df0-6bcf-4b37-8e86-cbef798ded66",
  waveDenimBottom: "https://www.figma.com/api/mcp/asset/3bf6cae0-d0d2-439e-8c48-7c35d757bd04",
  iconGreenCPW: "https://www.figma.com/api/mcp/asset/bc1f7486-1eb6-41a2-8628-a950e12ace66",
  iconBlueSustain: "https://www.figma.com/api/mcp/asset/ba4a6b9a-ee96-42c7-bf67-8f9d8113a790",
  star1: "https://www.figma.com/api/mcp/asset/1d1ac5c2-90e9-44b4-a75a-eaeb9adfe5f6",
  star2: "https://www.figma.com/api/mcp/asset/7aba942c-8a83-4f65-9dc4-2df2a337d857",
  star3: "https://www.figma.com/api/mcp/asset/9794e05c-b991-483d-b22b-b552b43116c7",
  tableImage: "https://www.figma.com/api/mcp/asset/86a7965b-61c0-48a8-94f3-1abe125c37fe",
  waveFooterAndPlaidTop: "https://www.figma.com/api/mcp/asset/70eadf7e-5b9a-4a5e-a3a6-6ae91d6d4459",
  logoImage: "https://www.figma.com/api/mcp/asset/c85546d0-0856-4202-99ec-51611a674df4",
  googleIcon: "https://www.figma.com/api/mcp/asset/654c7ecb-205b-40a2-88b0-dc257c29c397",
  tabInactive: "https://www.figma.com/api/mcp/asset/ac2f3189-2966-415f-b082-556e421f1231",
  lineNavbar: "https://www.figma.com/api/mcp/asset/752307d6-9ff8-4e46-824d-b65869c2ee9a",
};

export default function AboutPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col w-full overflow-hidden bg-white text-charcoal selection:bg-rust/30 pb-0">
      
      {/* Custom Folder-Tab Navbar matching Figma exactly */}
      <header className="w-full relative h-[80px] flex items-end px-4 md:px-8 z-50 pt-6">
        {/* Logo */}
        <div className="absolute left-4 md:left-8 top-4 w-[45px] h-[41px]">
          <img src={ASSETS.logoImage} alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Tabs */}
        <div className="hidden md:flex mx-auto items-end gap-[6px] relative z-10 pb-[1px]">
          <Link href="/analyze" className="w-[104px] h-[32px] relative flex items-center justify-center group">
            <img src={ASSETS.tabInactive} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <span className="relative z-10 font-serif font-bold text-white text-[20px]">Analyze</span>
          </Link>
          <Link href="/gallery" className="w-[104px] h-[32px] relative flex items-center justify-center group">
            <img src={ASSETS.tabInactive} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <span className="relative z-10 font-serif font-bold text-white text-[20px]">Gallery</span>
          </Link>
          <Link href="/brands" className="w-[104px] h-[32px] relative flex items-center justify-center group">
            <img src={ASSETS.tabInactive} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <span className="relative z-10 font-serif font-bold text-white text-[20px]">Brands</span>
          </Link>
          <div className="w-[129px] h-[40px] bg-[#5f6642] rounded-t-[10px] flex items-center justify-center relative">
            <span className="font-serif font-bold text-white text-[22px]">About</span>
          </div>
        </div>

        {/* Sign In */}
        <div className="hidden md:flex absolute right-8 bottom-[1px] w-[125px] h-[35px] bg-[#5f6642] rounded-t-[10px] items-center justify-center gap-2 cursor-pointer z-10">
          <span className="font-serif font-bold text-[#fff3f8] text-[20px]">Sign In</span>
          <img src={ASSETS.googleIcon} alt="Google" className="w-5 h-5 object-contain" />
        </div>

        {/* Bottom Line */}
        <div className="absolute bottom-0 left-0 w-full">
          <img src={ASSETS.lineNavbar} alt="" className="w-full h-[2px] object-cover" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-12 px-6 flex flex-col items-center z-10 bg-white">
        <div className="w-full max-w-[1100px] mt-10">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-4">
            <span className="text-[#5f6642]">How</span>
            <span className="text-[#5b6924]">UNRAVELED</span>
            <span className="text-[#5f6642]">Works</span>
          </h1>
          <p className="font-serif text-xl md:text-[24px] text-[#5f6642] max-w-4xl leading-relaxed">
            We combine real-time search data, machine learning models, and sustainability research to give you the full picture on any fashion trend — before you buy
          </p>
        </div>
      </section>

      {/* Trend Decay Model Section */}
      <section className="relative w-full pt-40 pb-32 flex flex-col items-center mt-[-60px]">
        {/* Background Pattern with Waves */}
        <div className="absolute inset-0 z-0 flex flex-col">
          <img src={ASSETS.waveFooterAndPlaidTop} alt="" className="w-full h-auto object-cover object-bottom" style={{ marginBottom: '-1px' }} />
          <div 
            className="flex-1 w-full"
            style={{ 
              backgroundImage: `url(${ASSETS.bgPattern})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
            }}
          />
          <img src={ASSETS.wavePlaidBottom} alt="" className="w-full h-auto object-cover object-top" style={{ marginTop: '-1px' }} />
        </div>

        <div className="relative z-10 w-full max-w-[1137px] bg-white rounded-[30px] p-10 md:p-14 shadow-sm mx-6 mt-10">
          <h2 className="font-serif text-[40px] font-bold text-[#5c6c47] mb-8 text-center md:text-left">
            Trend Decay Model
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-[50px] h-[50px] shrink-0">
                <img src={ASSETS.iconPinkDecay} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="font-serif text-[20px] font-bold text-[#5c6c47] pt-2 leading-[1.4]">
                We pull normalized search interest from Google Trends, cross-referenced with TikTok engagement data and Pinterest search signals, to build a time-series of trend velocity for any fashion keyword.
              </p>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-[50px] h-[50px] shrink-0">
                <img src={ASSETS.iconPinkDecay} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="font-serif text-[20px] font-bold text-[#5c6c47] pt-2 leading-[1.4]">
                A logistic growth + exponential decay curve is fit to the data. The model parameters (peak K, growth rate r, decay rate λ) determine where a trend sits in its lifecycle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {['Timeless', 'Trending', 'Fading', 'Dead'].map((label) => (
              <div key={label} className="bg-[#f7edb8] rounded-[30px] h-[63px] flex items-center justify-center">
                <span className="font-serif font-bold text-[#444930] text-[20px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Per Wear Section */}
      <section className="relative w-full py-16 flex flex-col items-center bg-white z-10">
        <div className="relative z-10 w-full max-w-[1137px] bg-[#e0bdc3] rounded-[30px] p-10 md:p-14 mx-6">
          <h2 className="font-serif text-[40px] font-bold text-white mb-10 text-center md:text-left">
            Cost Per Wear
          </h2>
          
          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-[49px] h-[48px] shrink-0 pt-1">
                <img src={ASSETS.iconGreenCPW} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-8 flex-1">
                <p className="font-serif text-[20px] font-bold text-white leading-[1.4]">
                  The standard Cost Per Wear formula divides the item price by the number of times you&apos;ll realistically wear it:
                </p>
                <div className="bg-[#f7edb8] rounded-[30px] py-8 px-10 flex flex-col justify-center gap-2">
                  <p className="font-serif font-bold text-[#5f6642] text-[20px]">
                    Standard CPW = Price ÷ Standard Wears
                  </p>
                  <p className="font-serif font-bold text-[#5f6642] text-[20px]">
                    Trend-Adjusted CPW = Price ÷ min(Standard Wears, Wears Per Week × Weeks Remaining)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-[49px] h-[48px] shrink-0 pt-1">
                <img src={ASSETS.iconGreenCPW} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="font-serif text-[20px] font-bold text-white leading-[1.4] pt-1">
                Standard wears are estimated per product category — a cotton tee gets ~30 wears, jeans ~70, a jacket ~90. When an item is trending or fading, the trend-adjusted CPW accounts for the risk that you&apos;ll stop wearing it before the fabric wears out.
              </p>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-[49px] h-[48px] shrink-0 pt-1">
                <img src={ASSETS.iconGreenCPW} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="font-serif text-[20px] font-bold text-white leading-[1.4] pt-1">
                We also generate a classic equivalent comparison — a timeless alternative with full material lifespan — so you can see the true cost difference between trendy and classic versions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Score Section */}
      <section className="relative w-full py-24 flex flex-col items-center">
        {/* Denim Background with Waves */}
        <div className="absolute inset-0 z-0 flex flex-col">
          <img src={ASSETS.waveDenimTop} alt="" className="w-full h-auto object-cover object-bottom" style={{ marginBottom: '-1px' }} />
          <div 
            className="flex-1 w-full"
            style={{ 
              backgroundImage: `url(${ASSETS.bgDenim})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <img src={ASSETS.waveDenimBottom} alt="" className="w-full h-auto object-cover object-top" style={{ marginTop: '-1px' }} />
        </div>

        <div className="relative z-10 w-full max-w-[1137px] bg-white rounded-[30px] p-10 md:p-14 mx-6 my-10 shadow-sm">
          <h2 className="font-serif text-[40px] font-bold text-[#5c6c47] mb-10 text-center md:text-left">
            Sustainability Score
          </h2>
          
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <div className="w-[50px] h-[50px] shrink-0 pt-1">
                <img src={ASSETS.iconBlueSustain} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-[20px] font-bold text-[#5c6c47] leading-[1.4] mb-8">
                  Our sustainability score is a weighted composite of three features, each contributing to an overall 0–100 score with A–F grading:
                </p>
                
                <div className="space-y-4">
                  {/* Fiber Composition */}
                  <div className="bg-[#f7edb8] rounded-[30px] min-h-[53px] flex items-center px-8 py-3 flex-wrap gap-x-4">
                    <span className="font-serif font-bold text-[#5f6642] text-[20px] min-w-[200px]">Fiber Composition</span>
                    <span className="font-serif font-medium text-[#5f6642] text-[16px]">Ranked by environmental impact — organic linen (0.95) to acrylic (0.20)</span>
                  </div>
                  
                  {/* Brand Reputation */}
                  <div className="bg-[#f7edb8] rounded-[30px] min-h-[53px] flex items-center px-8 py-3 flex-wrap gap-x-4">
                    <span className="font-serif font-bold text-[#5f6642] text-[20px] min-w-[200px]">Brand Reputation</span>
                    <span className="font-serif font-medium text-[#5f6642] text-[16px]">Aggregated from Good On You, B Corp, and Fashion Transparency Index</span>
                  </div>
                  
                  {/* Trend Longevity */}
                  <div className="bg-[#f7edb8] rounded-[30px] min-h-[53px] flex items-center px-8 py-3 flex-wrap gap-x-4">
                    <span className="font-serif font-bold text-[#5f6642] text-[20px] min-w-[200px]">Trend Longevity</span>
                    <span className="font-serif font-medium text-[#5f6642] text-[16px]">Timeless items score highest; dead trends score lowest</span>
                  </div>
                  
                  {/* Score Formula */}
                  <div className="bg-[#f7edb8] rounded-[30px] min-h-[53px] w-full md:w-fit flex items-center justify-center px-10 py-3 mt-6">
                    <span className="font-serif font-bold text-[#5f6642] text-[20px] text-center">Score = (Fiber × 0.5 + Brand × 0.3 + Trend × 0.2) × 100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-6 mt-12">
              <div className="w-[50px] h-[50px] shrink-0 pt-1">
                <img src={ASSETS.iconBlueSustain} alt="" className="w-full h-full object-contain" />
              </div>
              <p className="font-serif text-[20px] font-bold text-[#5c6c47] leading-[1.4] pt-1">
                With the Chrome Extension installed, exact fiber compositions and brand ratings are scraped from product pages. Without the extension, we estimate using category defaults and the trend signal alone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="relative w-full py-16 flex flex-col items-center bg-white z-10">
        <div className="relative z-10 w-full max-w-[1137px] bg-[#9bb9d0] rounded-[30px] p-10 md:p-14 mx-6">
          <h2 className="font-serif text-[40px] font-bold text-white mb-10 text-center">
            Data Sources
          </h2>
          
          <div className="w-full max-w-[1042px] mx-auto overflow-hidden rounded-[20px]">
            <img src={ASSETS.tableImage} alt="Data Sources Table" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="relative w-full min-h-[500px] flex flex-col items-center justify-center overflow-hidden mt-[-5px]">
        {/* Background Wave & Green Fill */}
        <div className="absolute inset-0 z-0 flex flex-col">
          <img src={ASSETS.waveFooterAndPlaidTop} alt="" className="w-full h-auto object-cover object-bottom" style={{ marginBottom: '-1px' }} />
          <div className="flex-1 w-full bg-[#5c6c47]" />
        </div>

        <div className="relative z-10 text-center px-6 mt-28 md:mt-40 w-full">
          <h2 className="font-serif font-semibold text-5xl md:text-[80px] text-white mb-8 tracking-wide drop-shadow-md">
            UNRAVELED
          </h2>
          <div className="font-serif text-[23px] font-bold text-white mb-12 max-w-xl mx-auto leading-[1.4] drop-shadow-sm flex flex-col gap-1">
            <p>Empowering consumers with material truth.</p>
            <p>End the cycle of fast fashion.</p>
          </div>
          <div className="pb-24">
            <Link 
              href="/extension-redirect" 
              className="inline-block bg-white text-[#5f6642] rounded-[30px] px-10 py-4 font-serif font-bold text-[24px] hover:bg-[#f7edb8] transition-colors"
            >
              Get Extension Now
            </Link>
          </div>
        </div>

        {/* Decorative Stars */}
        <div className="absolute left-[5%] bottom-[10%] w-[164px] h-[164px] z-10 pointer-events-none hidden md:block">
          <img src={ASSETS.star1} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[10%] bottom-[20%] w-[150px] h-[150px] z-10 pointer-events-none hidden md:block">
          <img src={ASSETS.star2} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[10%] bottom-[15%] w-[210px] h-[210px] z-10 pointer-events-none hidden md:block" style={{ transform: 'rotate(57deg)' }}>
          <img src={ASSETS.star2} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[15%] bottom-[30%] w-[182px] h-[182px] z-10 pointer-events-none hidden md:block" style={{ transform: 'rotate(57deg)' }}>
          <img src={ASSETS.star3} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[2%] bottom-[40%] w-[230px] h-[230px] z-10 pointer-events-none hidden lg:block" style={{ transform: 'rotate(57deg)' }}>
          <img src={ASSETS.star1} alt="" className="w-full h-full object-contain" />
        </div>
      </section>

    </main>
  );
}