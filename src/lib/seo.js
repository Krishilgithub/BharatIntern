export const defaultSEO = {
    title: "BharatIntern",
    description: "AI-driven Internship Recommendation & Allocation Engine",
    url: "https://example.com",
    image: "/og.png"
};

export function buildJsonLd({ title, description, url }) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: title,
        description,
        url
    };
}

