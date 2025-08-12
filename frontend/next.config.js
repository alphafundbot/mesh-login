// Strategist-grade Next.js configuration
const nextConfig = {
  /**
   * Allow cross-origin requests during development
   * from Cloud Workstation domains to access internal assets
   */
  allowedDevOrigins: [
    '8080-firebase-thin-wallet-1754708969246.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev',
    '*.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev'
  ]
}

export default nextConfig