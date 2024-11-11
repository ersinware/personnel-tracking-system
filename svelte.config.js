import adapter from '@sveltejs/adapter-node';

export default {
	kit: {
		adapter: adapter({precompress: false}),
		csrf: {checkOrigin: false},
		csp: {
			directives: {
				"default-src": ["self"],
				"img-src": ["self", "blob:", "data:"],
				"style-src": ["self", "unsafe-inline"],
				"font-src": ["self", "unsafe-inline"],
				"base-uri": ["self"],
				"frame-ancestors": ["none"],
				"frame-src": ["https://www.google.com/", "https://maps.google.com/"]
			},
			mode: "auto",
		}
	}
};