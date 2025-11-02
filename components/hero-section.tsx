"use client"
import { ContainerScroll } from "@/components/ui/container-scroll-animation"

export default function HeroSection() {
  return (
    <div className="flex flex-col overflow-hidden -mt-20">
      <ContainerScroll
        titleComponent={
          <>
            <div className="text-center px-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                One Inbox. Every Conversation.
              </h1>
              <p className="text-lg md:text-2xl text-white/90 italic font-light mt-4 tracking-normal">
                From SMS to Social, Handle It All in One Unified Workspace.
              </p>
              
            </div>
          </>
        }
      >
        <img
          src="/digital-blockchain-interface.jpg"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  )
}
