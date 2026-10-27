import os
from PIL import Image, ImageDraw, ImageFont

# Image dimensions for crisp high resolution (2x retina scale)
WIDTH = 1200
HEIGHT = 1600
BG_COLOR = (255, 255, 255)

img = Image.new("RGBA", (WIDTH, HEIGHT), BG_COLOR)
draw = ImageDraw.Draw(img)

# Try loading standard Windows TrueType fonts, fallback to default
def get_font(size, bold=False):
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    return ImageFont.load_default()

font_title_lg = get_font(34, bold=True)
font_tier_hdr = get_font(28, bold=True)
font_box_title = get_font(26, bold=True)
font_box_sub = get_font(22, bold=False)
font_label = get_font(20, bold=False)
font_label_bold = get_font(21, bold=True)
font_caption = get_font(28, bold=True)

# Helper function to draw centered text
def draw_centered_text(d, text, center_x, y, font, fill=(30, 41, 59)):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    d.text((center_x - w // 2, y), text, font=font, fill=fill)

# Helper function to draw an arrow pointing down
def draw_arrow_down(d, x, y_start, y_end, label="", label_align="right"):
    d.line([(x, y_start), (x, y_end)], fill=(71, 85, 105), width=3)
    # Arrow head
    d.polygon([(x - 8, y_end - 12), (x + 8, y_end - 12), (x, y_end)], fill=(71, 85, 105))
    if label:
        bbox = d.textbbox((0, 0), label, font=font_label)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        mid_y = (y_start + y_end) // 2 - h // 2
        if label_align == "right":
            d.text((x + 14, mid_y), label, font=font_label, fill=(51, 65, 85))
        elif label_align == "left":
            d.text((x - w - 14, mid_y), label, font=font_label, fill=(51, 65, 85))
        else:
            d.text((x - w // 2, mid_y - 14), label, font=font_label, fill=(51, 65, 85))

# Helper function to draw an angled arrow
def draw_arrow_angled(d, x_start, y_start, x_end, y_end, label="", label_dx=0, label_dy=-25):
    d.line([(x_start, y_start), (x_end, y_end)], fill=(71, 85, 105), width=3)
    import math
    angle = math.atan2(y_end - y_start, x_end - x_start)
    arrow_len = 16
    arrow_angle = math.pi / 7
    p1 = (x_end - arrow_len * math.cos(angle - arrow_angle), y_end - arrow_len * math.sin(angle - arrow_angle))
    p2 = (x_end - arrow_len * math.cos(angle + arrow_angle), y_end - arrow_len * math.sin(angle + arrow_angle))
    d.polygon([p1, p2, (x_end, y_end)], fill=(71, 85, 105))
    if label:
        mid_x = (x_start + x_end) // 2 + label_dx
        mid_y = (y_start + y_end) // 2 + label_dy
        draw_centered_text(d, label, mid_x, mid_y, font_label, fill=(51, 65, 85))

# Helper to draw a cylinder (database icon)
def draw_cylinder(d, x1, y1, x2, y2, fill, outline, title, line1, line2=""):
    r = 22
    # bottom ellipse
    d.ellipse([(x1, y2 - 2 * r), (x2, y2)], fill=fill, outline=outline, width=3)
    # rect body
    d.rectangle([(x1, y1 + r), (x2, y2 - r)], fill=fill, outline=None)
    d.line([(x1, y1 + r), (x1, y2 - r)], fill=outline, width=3)
    d.line([(x2, y1 + r), (x2, y2 - r)], fill=outline, width=3)
    # top ellipse
    d.ellipse([(x1, y1), (x2, y1 + 2 * r)], fill=(255, 255, 255), outline=outline, width=3)
    
    # Texts
    cx = (x1 + x2) // 2
    draw_centered_text(d, title, cx, y1 + 38, font_box_title, fill=(15, 23, 42))
    draw_centered_text(d, line1, cx, y1 + 76, font_box_sub, fill=(51, 65, 85))
    if line2:
        draw_centered_text(d, line2, cx, y1 + 106, font_box_sub, fill=(51, 65, 85))

# ==========================================
# 1. CLIENT TIER (Blue Container)
# ==========================================
c_x1, c_y1, c_x2, c_y2 = 220, 50, 980, 260
draw.rounded_rectangle([(c_x1, c_y1), (c_x2, c_y2)], radius=24, fill=(238, 246, 255), outline=(147, 197, 253), width=3)
draw_centered_text(draw, "Client tier", 600, c_y1 + 16, font_tier_hdr, fill=(3, 105, 161))

# Inner Client Box
box_c_x1, box_c_y1, box_c_x2, box_c_y2 = 250, 105, 950, 235
draw.rounded_rectangle([(box_c_x1, box_c_y1), (box_c_x2, box_c_y2)], radius=18, fill=(255, 255, 255), outline=(186, 230, 253), width=2)
draw_centered_text(draw, "React 18 + TypeScript SPA", 600, box_c_y1 + 18, font_box_title, fill=(12, 74, 110))
draw_centered_text(draw, "(Vite, Tailwind CSS)", 600, box_c_y1 + 54, font_box_sub, fill=(71, 85, 105))
draw_centered_text(draw, "Student portal | Smart Planner | Admin dashboard", 600, box_c_y1 + 86, font_box_sub, fill=(15, 23, 42))

# Arrow Client -> Proxy
draw_arrow_down(draw, 600, 260, 325, label="HTTPS / JSON", label_align="right")

# ==========================================
# REVERSE PROXY (Nginx)
# ==========================================
p_x1, p_y1, p_x2, p_y2 = 420, 325, 780, 405
draw.rounded_rectangle([(p_x1, p_y1), (p_x2, p_y2)], radius=26, fill=(255, 255, 255), outline=(100, 116, 139), width=3)
draw_centered_text(draw, "Nginx reverse proxy", 600, p_y1 + 14, font_box_title, fill=(15, 23, 42))
draw_centered_text(draw, "(Docker)", 600, p_y1 + 46, font_box_sub, fill=(71, 85, 105))

# Arrow Proxy -> App Tier
draw_arrow_down(draw, 600, 405, 470, label="/api", label_align="right")

# ==========================================
# 2. APPLICATION TIER (Green Container)
# ==========================================
a_x1, a_y1, a_x2, a_y2 = 180, 470, 1020, 1060
draw.rounded_rectangle([(a_x1, a_y1), (a_x2, a_y2)], radius=24, fill=(240, 253, 244), outline=(134, 239, 172), width=3)
draw_centered_text(draw, "Application tier (Node.js + Express + TypeScript)", 600, a_y1 + 18, font_tier_hdr, fill=(21, 128, 61))

# Box 1: Middleware
m_x1, m_y1, m_x2, m_y2 = 290, 530, 910, 630
draw.rounded_rectangle([(m_x1, m_y1), (m_x2, m_y2)], radius=18, fill=(255, 255, 255), outline=(187, 247, 208), width=2)
draw_centered_text(draw, "Middleware", 600, m_y1 + 18, font_box_title, fill=(20, 83, 45))
draw_centered_text(draw, "JWT authentication | RBAC | Zod validation", 600, m_y1 + 54, font_box_sub, fill=(51, 65, 85))

# Arrow Middleware -> Routes
draw_arrow_down(draw, 600, 630, 690)

# Box 2: Routes
r_x1, r_y1, r_x2, r_y2 = 320, 690, 880, 810
draw.rounded_rectangle([(r_x1, r_y1), (r_x2, r_y2)], radius=18, fill=(255, 255, 255), outline=(187, 247, 208), width=2)
draw_centered_text(draw, "REST routes", 600, r_y1 + 14, font_box_title, fill=(20, 83, 45))
draw_centered_text(draw, "auth | courses | registrations | planner", 600, r_y1 + 46, font_box_sub, fill=(51, 65, 85))
draw_centered_text(draw, "recommendations | admin", 600, r_y1 + 76, font_box_sub, fill=(51, 65, 85))

# Arrow Routes -> Services
draw_arrow_down(draw, 600, 810, 870)

# Box 3: Services
s_x1, s_y1, s_x2, s_y2 = 220, 870, 980, 970
draw.rounded_rectangle([(s_x1, s_y1), (s_x2, s_y2)], radius=18, fill=(255, 255, 255), outline=(187, 247, 208), width=2)
draw_centered_text(draw, "Services", 600, s_y1 + 18, font_box_title, fill=(20, 83, 45))
draw_centered_text(draw, "Registration | Planner | Recommendation | Admin | Audit", 600, s_y1 + 54, font_box_sub, fill=(15, 23, 42))

# ==========================================
# 3. DATA TIER (Amber / Gold Container)
# ==========================================
d_x1, d_y1, d_x2, d_y2 = 120, 1140, 1080, 1440
draw.rounded_rectangle([(d_x1, d_y1), (d_x2, d_y2)], radius=24, fill=(254, 252, 232), outline=(252, 211, 77), width=3)
draw_centered_text(draw, "Data tier", 600, d_y1 + 18, font_tier_hdr, fill=(180, 83, 9))

# Angled Arrows Services -> Data Tier
draw_arrow_angled(draw, 450, 970, 360, 1220, label="ACID transactions", label_dx=-50, label_dy=-15)
draw_arrow_angled(draw, 750, 970, 840, 1220, label="INCR / DECR, lock", label_dx=40, label_dy=-15)

# Left Cylinder: PostgreSQL 16
draw_cylinder(draw, 160, 1220, 560, 1390, fill=(255, 255, 255), outline=(100, 116, 139),
              title="PostgreSQL 16",
              line1="normalised schema, constraints,",
              line2="indexes, audit log")

# Right Cylinder: Redis 7
draw_cylinder(draw, 640, 1220, 1040, 1390, fill=(255, 255, 255), outline=(100, 116, 139),
              title="Redis 7",
              line1="atomic seat counters",
              line2="registration locks (TTL)")

# ==========================================
# CAPTION AT BOTTOM
# ==========================================
draw_centered_text(draw, "Figure 4.1 System architecture of SmartPlanner", 600, 1490, font_caption, fill=(15, 23, 42))

# Save image
output_path = os.path.abspath("system_architecture_smartplanner.png")
img.save(output_path, "PNG", dpi=(300, 300))
print(f"IMAGE_SAVED: {output_path}")
