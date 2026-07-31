package com.trio.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.regex.Pattern;

@Component
@Slf4j
public class XSSFilter implements Filter {

    private static final Pattern[] XSS_PATTERNS = {
            Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL),
            Pattern.compile("on\\w+\\s*=\\s*\"[^\"]*\"", Pattern.CASE_INSENSITIVE),
            Pattern.compile("on\\w+\\s*=\\s*'[^']*'", Pattern.CASE_INSENSITIVE),
            Pattern.compile("on\\w+\\s*=\\s*[^\\s>]+", Pattern.CASE_INSENSITIVE),
            Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE),
            Pattern.compile("vbscript\\s*:", Pattern.CASE_INSENSITIVE),
            Pattern.compile("expression\\s*\\([^)]*\\)", Pattern.CASE_INSENSITIVE),
    };

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XSSRequestWrapper((HttpServletRequest) request), response);
    }

    private static class XSSRequestWrapper extends HttpServletRequestWrapper {
        private byte[] cachedBody;

        XSSRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return sanitize(value);
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;
            String[] sanitized = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                sanitized[i] = sanitize(values[i]);
            }
            return sanitized;
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            return sanitize(value);
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            if (cachedBody == null) {
                cacheBody();
            }
            return new CachedBodyServletInputStream(cachedBody);
        }

        @Override
        public BufferedReader getReader() throws IOException {
            if (cachedBody == null) {
                cacheBody();
            }
            return new BufferedReader(new InputStreamReader(new ByteArrayInputStream(cachedBody)));
        }

        private void cacheBody() throws IOException {
            String body = new String(super.getInputStream().readAllBytes());
            String sanitized = sanitize(body);
            cachedBody = sanitized.getBytes();
        }
    }

    private static class CachedBodyServletInputStream extends ServletInputStream {
        private final ByteArrayInputStream inputStream;

        CachedBodyServletInputStream(byte[] body) {
            this.inputStream = new ByteArrayInputStream(body);
        }

        @Override
        public int read() {
            return inputStream.read();
        }

        @Override
        public boolean isFinished() {
            return inputStream.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener listener) {
            throw new UnsupportedOperationException();
        }
    }

    public static String sanitize(String input) {
        if (input == null) return null;
        String sanitized = input;
        for (Pattern pattern : XSS_PATTERNS) {
            sanitized = pattern.matcher(sanitized).replaceAll("");
        }
        sanitized = sanitized
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
        return sanitized;
    }
}
