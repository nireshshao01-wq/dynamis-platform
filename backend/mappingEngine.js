const mappings = [

  /* =========================
     COMPUTE
  ========================= */

  {
    match: ["EC2", "Virtual Machines", "Compute Engine"],
    category: "Compute",
    subcategory: "Virtual Machines",
    behaviour: "Optimisable"
  },

  {
    match: ["Lambda", "Functions", "Cloud Functions"],
    category: "Compute",
    subcategory: "Serverless",
    behaviour: "Elastic"
  },

  {
    match: ["Kubernetes", "EKS", "AKS", "GKE"],
    category: "Compute",
    subcategory: "Containers",
    behaviour: "Elastic"
  },

  /* =========================
     STORAGE
  ========================= */

  {
    match: ["S3", "Blob", "Cloud Storage"],
    category: "Storage",
    subcategory: "Object Storage",
    behaviour: "Elastic"
  },

  {
    match: ["EBS", "Managed Disks"],
    category: "Storage",
    subcategory: "Block Storage",
    behaviour: "Optimisable"
  },

  {
    match: ["Snapshots"],
    category: "Storage",
    subcategory: "Backups",
    behaviour: "Waste"
  },

  /* =========================
     NETWORK
  ========================= */

  {
    match: ["Data Transfer", "Bandwidth"],
    category: "Networking",
    subcategory: "Data Transfer",
    behaviour: "Risk Spend"
  },

  {
    match: ["Load Balancer"],
    category: "Networking",
    subcategory: "Load Balancing",
    behaviour: "Elastic"
  },

  /* =========================
     DATABASE
  ========================= */

  {
    match: ["RDS", "SQL", "Cloud SQL"],
    category: "Databases",
    subcategory: "Relational DB",
    behaviour: "Optimisable"
  },

  {
    match: ["DynamoDB", "Cosmos"],
    category: "Databases",
    subcategory: "NoSQL",
    behaviour: "Elastic"
  }

]

function mapService(serviceName = "") {

  const found = mappings.find(m =>
    m.match.some(keyword =>
      serviceName.toLowerCase().includes(keyword.toLowerCase())
    )
  )

  return found || {
    category: "Other",
    subcategory: "Unmapped",
    behaviour: "Unknown"
  }
}

module.exports = { mapService }