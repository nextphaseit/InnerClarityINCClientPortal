const Navigation = () => {
  const user = { name: "Inner Clarity" } // Added a user object for the Avatar component

  return (
    <nav>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/services">Services</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
        </li>
      </ul>
      <div>
        <h3>Contact Information</h3>
        <p>Phone: (984) 274-3723</p>
        <p>Email: support@innerclarityinc.com</p>
        <p>Address: 508 River Dell Townes Ave, Clayton, NC</p>
      </div>
      {/* Avatar Section - Assumed placement based on context */}
      <div>
        {/* Example Avatar Component - Replace with your actual Avatar component */}
        <AvatarImage src="/images/inner-clarity-logo.png" alt={user.name} />
      </div>

      {/* Mobile Navigation Avatar Section - Assumed placement based on context */}
      <div>
        {/* Example Mobile Navigation Avatar Component - Replace with your actual component */}
        <AvatarImage src="/images/inner-clarity-logo.png" alt={user.name} />
      </div>
    </nav>
  )
}

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src || "/placeholder.svg"} alt={alt} style={{ width: "50px", height: "50px", borderRadius: "50%" }} />
)

export default Navigation
