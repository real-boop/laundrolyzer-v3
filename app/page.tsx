import BackgroundPaths from "@/components/kokonutui/background-paths"

export default function Home() {
  return (
    <main>
      <BackgroundPaths title="Laundrolyzer" showLogo={true}>
        {/* children content will be the URL input form by default */}
      </BackgroundPaths>
    </main>
  )
}

