import os
import math
from PIL import Image, ImageDraw, ImageFont

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

font_cap = get_font(28, bold=True)
font_node_b = get_font(22, bold=True)
font_node = get_font(20, bold=False)
font_node_sm = get_font(18, bold=False)
font_lbl = get_font(18, bold=False)
font_lbl_b = get_font(19, bold=True)

def draw_centered_text(d, text, cx, y, font, fill=(15, 23, 42)):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    d.text((cx - w // 2, y), text, font=font, fill=fill)

def draw_arrow(d, p1, p2, fill=(71, 85, 105), width=2, arrow_size=12):
    x1, y1 = p1
    x2, y2 = p2
    d.line([p1, p2], fill=fill, width=width)
    angle = math.atan2(y2 - y1, x2 - x1)
    a1 = angle - math.pi / 7
    a2 = angle + math.pi / 7
    pt1 = (x2 - arrow_size * math.cos(a1), y2 - arrow_size * math.sin(a1))
    pt2 = (x2 - arrow_size * math.cos(a2), y2 - arrow_size * math.sin(a2))
    d.polygon([pt1, pt2, (x2, y2)], fill=fill)

# =========================================================================
# FIGURE 4.2: FLOWCHART OF SCHEDULE GENERATION ALGORITHM
# =========================================================================
def generate_figure_4_2():
    W, H = 1000, 1450
    img = Image.new("RGBA", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    CX = 500
    y = 40

    # 1. Start Pill
    d.rounded_rectangle([(CX - 60, y), (CX + 60, y + 45)], radius=22, fill=(236, 253, 245), outline=(110, 231, 183), width=2)
    draw_centered_text(d, "Start", CX, y + 10, font_node_b, fill=(6, 95, 70))
    draw_arrow(d, (CX, y + 45), (CX, y + 85))
    y += 85

    # 2. Receive selected course codes
    d.rounded_rectangle([(CX - 200, y), (CX + 200, y + 60)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Receive selected course codes", CX, y + 8, font_node)
    draw_centered_text(d, "and student preferences", CX, y + 32, font_node)
    draw_arrow(d, (CX, y + 60), (CX, y + 100))
    y += 100

    # 3. Load sections
    d.rounded_rectangle([(CX - 230, y), (CX + 230, y + 60)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Load sections, meeting slots, seat counts,", CX, y + 8, font_node)
    draw_centered_text(d, "prerequisites and completed courses", CX, y + 32, font_node)
    draw_arrow(d, (CX, y + 60), (CX, y + 100))
    y += 100

    # 4. Form candidate schedules
    d.rounded_rectangle([(CX - 190, y), (CX + 190, y + 55)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Form candidate schedules:", CX, y + 6, font_node)
    draw_centered_text(d, "one section chosen per course", CX, y + 28, font_node)
    draw_arrow(d, (CX, y + 55), (CX, y + 95))
    y += 95

    # 5. Next candidate schedule
    next_cand_y = y
    d.rounded_rectangle([(CX - 150, y), (CX + 150, y + 50)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Next candidate schedule", CX, y + 13, font_node)
    draw_arrow(d, (CX, y + 50), (CX, y + 90))
    y += 90

    # 6. Decision Diamond: Any two meetings collide?
    dia_h = 100
    dia_w = 420
    d_pts = [(CX, y), (CX + dia_w, y + dia_h // 2), (CX, y + dia_h), (CX - dia_w, y + dia_h // 2)]
    d.polygon(d_pts, fill=(254, 252, 232), outline=(234, 179, 8), width=2)
    draw_centered_text(d, "Any two meetings on the same weekday", CX, y + 24, font_node)
    draw_centered_text(d, "with start1 < end2 and start2 < end1?", CX, y + 52, font_node_b, fill=(180, 83, 9))
    y_dia_bot = y + dia_h
    y_dia_mid = y + dia_h // 2
    y += dia_h

    # Left branch (yes): Discard schedule (collision)
    left_x = CX - 220
    right_x = CX + 200
    sub_y = y + 55

    # Left Arrow (Yes)
    d.line([(CX - 160, y_dia_bot - 10), (left_x, sub_y)], fill=(71, 85, 105), width=2)
    d.text((CX - 150, y_dia_bot + 4), "yes", font=font_lbl_b, fill=(225, 29, 72))
    d.rounded_rectangle([(left_x - 110, sub_y), (left_x + 110, sub_y + 55)], radius=14, fill=(255, 241, 242), outline=(251, 113, 133), width=2)
    draw_centered_text(d, "Discard schedule", left_x, sub_y + 6, font_node, fill=(159, 18, 57))
    draw_centered_text(d, "(collision)", left_x, sub_y + 28, font_node_b, fill=(159, 18, 57))

    # Right Arrow (No)
    d.line([(CX + 160, y_dia_bot - 10), (right_x, sub_y)], fill=(71, 85, 105), width=2)
    d.text((CX + 125, y_dia_bot + 4), "no", font=font_lbl_b, fill=(13, 148, 136))
    d.rounded_rectangle([(right_x - 220, sub_y), (right_x + 220, sub_y + 65)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Compute score:", right_x, sub_y + 8, font_node_b)
    draw_centered_text(d, "prerequisites +100, core +50, seats +20,", right_x, sub_y + 24, font_node_sm)
    draw_centered_text(d, "time preference +15, balanced credits +10", right_x, sub_y + 42, font_node_sm)

    # 7. Merge to "More candidates?" diamond
    y = sub_y + 100
    d.line([(left_x, sub_y + 55), (left_x, y + 25), (CX - 150, y + 30)], fill=(71, 85, 105), width=2)
    d.line([(right_x, sub_y + 65), (right_x, y + 25), (CX + 150, y + 30)], fill=(71, 85, 105), width=2)
    draw_arrow(d, (CX, y - 10), (CX, y))

    m_dia_w = 170
    m_dia_h = 60
    m_pts = [(CX, y), (CX + m_dia_w, y + m_dia_h // 2), (CX, y + m_dia_h), (CX - m_dia_w, y + m_dia_h // 2)]
    d.polygon(m_pts, fill=(254, 252, 232), outline=(234, 179, 8), width=2)
    draw_centered_text(d, "More candidates?", CX, y + 18, font_node)

    # Loop back for "yes" (curving right)
    loop_right_x = CX + 360
    d.line([(CX + m_dia_w, y + m_dia_h // 2), (loop_right_x, y + m_dia_h // 2), (loop_right_x, next_cand_y + 25), (CX + 150, next_cand_y + 25)], fill=(71, 85, 105), width=2)
    draw_arrow(d, (CX + 160, next_cand_y + 25), (CX + 150, next_cand_y + 25))
    d.text((loop_right_x + 10, (y + next_cand_y) // 2), "yes", font=font_lbl_b, fill=(13, 148, 136))

    # Down for "no"
    d.text((CX + 10, y + m_dia_h + 10), "no", font=font_lbl_b, fill=(71, 85, 105))
    draw_arrow(d, (CX, y + m_dia_h), (CX, y + m_dia_h + 55))
    y = y + m_dia_h + 55

    # 8. Rank schedules by score
    d.rounded_rectangle([(CX - 180, y), (CX + 180, y + 50)], radius=14, fill=(255, 255, 255), outline=(100, 116, 139), width=2)
    draw_centered_text(d, "Rank schedules by score (descending)", CX, y + 13, font_node)
    draw_arrow(d, (CX, y + 50), (CX, y + 90))
    y += 90

    # 9. Return best schedule & alternatives
    d.rounded_rectangle([(CX - 190, y), (CX + 190, y + 52)], radius=14, fill=(238, 242, 255), outline=(165, 180, 252), width=2)
    draw_centered_text(d, "Return best schedule and alternatives", CX, y + 13, font_node_b, fill=(67, 56, 202))
    draw_arrow(d, (CX, y + 52), (CX, y + 90))
    y += 90

    # 10. End Pill
    d.rounded_rectangle([(CX - 60, y), (CX + 60, y + 45)], radius=22, fill=(236, 253, 245), outline=(110, 231, 183), width=2)
    draw_centered_text(d, "End", CX, y + 10, font_node_b, fill=(6, 95, 70))

    # Caption
    draw_centered_text(d, "Figure 4.2  Flowchart of the schedule generation algorithm", CX, H - 45, font_cap, fill=(15, 23, 42))

    img.save("figure_4_2_schedule_flowchart.png", "PNG", dpi=(300, 300))
    print("SAVED: figure_4_2_schedule_flowchart.png")

# =========================================================================
# FIGURE 4.3: CLASS / ENTITY DIAGRAM OF SMARTPLANNER DATA MODEL
# =========================================================================
def generate_figure_4_3():
    W, H = 1400, 1000
    img = Image.new("RGBA", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    def draw_entity(x, y, w, h, title, rows, hdr_fill=(224, 236, 250), border_color=(71, 85, 105)):
        # outer box
        d.rectangle([(x, y), (x + w, y + h)], fill=(255, 255, 255), outline=border_color, width=2)
        # header box
        hdr_h = 36
        d.rectangle([(x, y), (x + w, y + hdr_h)], fill=hdr_fill, outline=border_color, width=2)
        draw_centered_text(d, title, x + w // 2, y + 6, font_node_b, fill=(15, 23, 42))
        # rows
        curr_y = y + hdr_h + 8
        for row in rows:
            d.text((x + 12, curr_y), row, font=font_lbl, fill=(30, 41, 59))
            curr_y += 24

    # 1. users
    draw_entity(100, 100, 240, 140, "users", [
        "PK id",
        "email (unique)",
        "password_hash",
        "role (STUDENT | ADMIN)"
    ], hdr_fill=(224, 236, 250))

    # 2. students
    draw_entity(520, 130, 240, 120, "students", [
        "PK id",
        "FK user_id",
        "major, semester, gpa"
    ], hdr_fill=(224, 236, 250))

    # 3. audit_logs
    draw_entity(960, 50, 260, 140, "audit_logs", [
        "PK id, FK student_id",
        "FK section_id",
        "action (REGISTER | DROP)",
        "created_at"
    ], hdr_fill=(236, 253, 245))

    # 4. completed_courses
    draw_entity(980, 260, 240, 120, "completed_courses", [
        "FK student_id",
        "FK course_id",
        "grade"
    ], hdr_fill=(224, 236, 250))

    # 5. faculty / department
    draw_entity(120, 310, 220, 100, "faculty", [
        "PK id",
        "name, department"
    ], hdr_fill=(224, 236, 250))

    # 6. courses
    draw_entity(120, 570, 240, 140, "courses", [
        "PK id",
        "code (unique), title",
        "department, credits",
        "is_core, semester"
    ], hdr_fill=(224, 236, 250))

    # 7. sections
    draw_entity(520, 580, 260, 120, "sections", [
        "PK id",
        "FK course_id, FK faculty_id",
        "room, capacity"
    ], hdr_fill=(224, 236, 250))

    # 8. enrollments
    draw_entity(950, 450, 280, 140, "enrollments", [
        "PK id",
        "FK student_id, FK section_id",
        "status, enrolled_at",
        "UNIQUE (student, section)"
    ], hdr_fill=(254, 243, 199))

    # 9. prerequisites
    draw_entity(540, 770, 240, 100, "prerequisites", [
        "FK course_id",
        "FK required_course_id"
    ], hdr_fill=(224, 236, 250))

    # 10. section_schedules
    draw_entity(980, 660, 240, 120, "section_schedules", [
        "PK id, FK section_id",
        "weekday",
        "start_time, end_time"
    ], hdr_fill=(224, 236, 250))

    # CONNECTIONS & MULTIPLICITY LABELS
    def draw_rel(p1, p2, label1="1", label2="N", label_mid=""):
        d.line([p1, p2], fill=(71, 85, 105), width=2)
        if label_mid:
            mx, my = (p1[0] + p2[0]) // 2, (p1[1] + p2[1]) // 2
            d.text((mx - 10, my - 16), label_mid, font=font_lbl, fill=(71, 85, 105))

    # users (340, 170) -> students (520, 170)
    draw_rel((340, 170), (520, 170), label_mid="1 : 1")

    # students (760, 170) -> audit_logs (960, 140)
    draw_rel((760, 170), (960, 140), label_mid="1 : N")

    # students (760, 220) -> completed_courses (980, 280)
    draw_rel((760, 220), (980, 280), label_mid="1 : N")

    # students (730, 250) -> enrollments (950, 460)
    draw_rel((730, 250), (950, 460), label_mid="1 : N")

    # faculty (340, 410) -> sections (520, 580)
    draw_rel((310, 410), (550, 580), label_mid="1 : N")

    # courses (360, 640) -> sections (520, 640)
    draw_rel((360, 640), (520, 640), label_mid="1 : N")

    # courses (360, 680) -> completed_courses (980, 360)
    draw_rel((360, 600), (980, 360), label_mid="1 : N")

    # courses (330, 710) -> prerequisites (540, 800)
    draw_rel((330, 710), (540, 800), label_mid="1 : N")

    # sections (780, 620) -> enrollments (950, 560)
    draw_rel((780, 620), (950, 560), label_mid="1 : N")

    # sections (780, 680) -> section_schedules (980, 710)
    draw_rel((780, 680), (980, 710), label_mid="1 : N")

    # Caption
    draw_centered_text(d, "Figure 4.3  Class (entity) diagram of the SmartPlanner data model", W // 2, H - 45, font_cap, fill=(15, 23, 42))

    img.save("figure_4_3_entity_diagram.png", "PNG", dpi=(300, 300))
    print("SAVED: figure_4_3_entity_diagram.png")

# =========================================================================
# FIGURE 4.4: SEQUENCE DIAGRAM OF A REGISTRATION REQUEST
# =========================================================================
def generate_figure_4_4():
    W, H = 1200, 1250
    img = Image.new("RGBA", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    X_STU = 180
    X_API = 440
    X_REDIS = 700
    X_DB = 960

    actors = [
        ("Student\n(React UI)", X_STU, (238, 242, 255), (165, 180, 252)),
        ("Express API", X_API, (241, 245, 249), (148, 163, 184)),
        ("Redis", X_REDIS, (254, 242, 242), (252, 165, 165)),
        ("MongoDB Database", X_DB, (236, 253, 245), (110, 231, 183)),
    ]

    # Draw Header Lifeline Boxes
    for name, cx, bg, border in actors:
        box_w, box_h = 130, 60
        d.rounded_rectangle([(cx - box_w // 2, 70), (cx + box_w // 2, 130)], radius=12, fill=bg, outline=border, width=2)
        lines = name.split('\n')
        if len(lines) == 1:
            draw_centered_text(d, lines[0], cx, 86, font_node_b, fill=(15, 23, 42))
        else:
            draw_centered_text(d, lines[0], cx, 78, font_node_b, fill=(15, 23, 42))
            draw_centered_text(d, lines[1], cx, 102, font_lbl, fill=(71, 85, 105))

    # Draw Dashed Lifelines
    y_start_line = 130
    y_end_line = 1040
    for _, cx, _, _ in actors:
        curr = y_start_line
        while curr < y_end_line:
            d.line([(cx, curr), (cx, curr + 8)], fill=(148, 163, 184), width=2)
            curr += 16

    def draw_msg(y, x1, x2, label, dashed=False, arrow_dir="forward"):
        if dashed:
            curr = min(x1, x2)
            max_x = max(x1, x2)
            while curr < max_x:
                d.line([(curr, y), (min(curr + 6, max_x), y)], fill=(71, 85, 105), width=2)
                curr += 12
        else:
            d.line([(x1, y), (x2, y)], fill=(71, 85, 105), width=2)

        if arrow_dir == "forward":
            draw_arrow(d, (x1, y), (x2, y))
        else:
            draw_arrow(d, (x2, y), (x1, y))

        draw_centered_text(d, label, (x1 + x2) // 2, y - 22, font_lbl, fill=(15, 23, 42))

    # 1. POST /api/registrations (sectionId) + JWT
    draw_msg(180, X_STU, X_API, "POST /api/registrations (sectionId) + JWT")

    # 2. Self Arrow: Authenticate, check role, validate input
    d.line([(X_API, 230), (X_API + 45, 230), (X_API + 45, 260), (X_API, 260)], fill=(71, 85, 105), width=2)
    draw_arrow(d, (X_API + 20, 260), (X_API, 260))
    d.text((X_API + 55, 236), "Authenticate, check role, validate input", font=font_lbl, fill=(51, 65, 85))

    # 3. Verify prerequisites / duplicate enrollment -> MongoDB
    draw_msg(310, X_API, X_DB, "Verify prerequisites / duplicate enrollment")

    # 4. SET lock:registration:{studentId}:{sectionId} NX EX -> Redis
    draw_msg(380, X_API, X_REDIS, "SET lock:registration:{studentId}:{sectionId} NX EX")

    # 5. lock acquired (dashed)
    draw_msg(450, X_API, X_REDIS, "lock acquired", dashed=True, arrow_dir="backward")

    # 6. DECR seats:{sectionId} -> Redis
    draw_msg(520, X_API, X_REDIS, "DECR seats:{sectionId}")

    # 7. remaining seats (>= 0) (dashed)
    draw_msg(590, X_API, X_REDIS, "remaining seats (>= 0)", dashed=True, arrow_dir="backward")

    # 8. INSERT enrollment; INSERT audit_log -> MongoDB
    draw_msg(660, X_API, X_DB, "INSERT enrollment; INSERT audit_log;")

    # 9. saved / committed (dashed)
    draw_msg(730, X_API, X_DB, "committed", dashed=True, arrow_dir="backward")

    # 10. DEL lock key -> Redis
    draw_msg(800, X_API, X_REDIS, "DEL lock key")

    # 11. 201 Created (seat badge updated) -> Student
    draw_msg(870, X_API, X_STU, "201 Created (seat badge updated)", dashed=True, arrow_dir="backward")

    # Bottom Failure Note Box
    nb_y1, nb_y2 = 940, 1030
    d.rounded_rectangle([(200, nb_y1), (1000, nb_y2)], radius=16, fill=(255, 251, 235), outline=(245, 158, 11), width=2)
    draw_centered_text(d, "Failure path: if DECR returns < 0, or database insert fails, the API runs INCR seats:{sectionId}", 600, nb_y1 + 16, font_lbl, fill=(180, 83, 9))
    draw_centered_text(d, "(restoring the seat), releases the lock and returns an error to the student.", 600, nb_y1 + 44, font_lbl, fill=(180, 83, 9))

    # Caption
    draw_centered_text(d, "Figure 4.4  Sequence diagram of a registration request", W // 2, H - 45, font_cap, fill=(15, 23, 42))

    img.save("figure_4_4_sequence_diagram.png", "PNG", dpi=(300, 300))
    print("SAVED: figure_4_4_sequence_diagram.png")

if __name__ == "__main__":
    generate_figure_4_2()
    generate_figure_4_3()
    generate_figure_4_4()
