"""
DermAssist AI — PDF Report Generator
Place in: backend/report_generator.py
Install:  pip install reportlab
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.graphics.shapes import Drawing, Rect
from io import BytesIO
from datetime import datetime
import json

BRAND_BLUE   = colors.HexColor('#1d4ed8')
BRAND_DARK   = colors.HexColor('#0f172a')
BRAND_GRAY   = colors.HexColor('#64748b')
BRAND_LIGHT  = colors.HexColor('#f8fafc')
BRAND_BORDER = colors.HexColor('#e2e8f0')
WHITE        = colors.white

RISK_COLORS = {
    'High Risk':     colors.HexColor('#dc2626'),
    'Moderate Risk': colors.HexColor('#d97706'),
    'Low Risk':      colors.HexColor('#059669'),
}
RISK_BG = {
    'High Risk':     colors.HexColor('#fff5f5'),
    'Moderate Risk': colors.HexColor('#fffbeb'),
    'Low Risk':      colors.HexColor('#f0fdf4'),
}
NAME_MAP = {
    'mel':'Melanoma','bcc':'Basal Cell Carcinoma','akiec':'Actinic Keratosis',
    'bkl':'Benign Keratosis','df':'Dermatofibroma','vasc':'Vascular Lesion','nv':'Melanocytic Nevi',
}
DESCRIPTIONS = {
    'mel':  'Melanoma is the most serious form of skin cancer arising from melanocytes. It can spread rapidly to other organs if not caught early. Immediate specialist evaluation is critical.',
    'bcc':  'Basal Cell Carcinoma is the most common skin cancer. While it rarely metastasizes, it can cause local tissue destruction. Early treatment yields excellent outcomes.',
    'akiec':'Actinic Keratosis is a precancerous rough patch caused by prolonged sun exposure. Without treatment, a small percentage can progress to squamous cell carcinoma.',
    'bkl':  'Benign Keratosis (seborrheic keratosis) is a non-cancerous skin growth common with aging. It typically requires no treatment unless causing discomfort.',
    'df':   'Dermatofibroma is a common benign fibrous nodule usually found on the legs. It is harmless and generally needs no treatment unless symptomatic.',
    'vasc': 'Vascular Lesion refers to abnormalities of skin blood vessels such as hemangiomas. Most are benign but warrant evaluation by a dermatologist.',
    'nv':   'Melanocytic Nevi (common moles) are benign pigmented growths. Most are harmless — however, changes in size, shape or color should be evaluated promptly.',
}
RECOMMENDATIONS = {
    'High Risk':     'Seek immediate dermatological consultation within 3–5 business days. Do NOT delay — early detection significantly improves outcomes for high-risk lesions.',
    'Moderate Risk': 'Schedule a dermatology appointment within the next 2–4 weeks. A board-certified dermatologist should inspect and potentially biopsy the lesion.',
    'Low Risk':      'No immediate action required. Perform regular monthly skin self-examinations. Apply broad-spectrum SPF 30+ sunscreen daily and avoid prolonged sun exposure.',
}
CLASS_RISK = {
    'mel':'High','bcc':'High','akiec':'High',
    'bkl':'Moderate','df':'Moderate','vasc':'Moderate','nv':'Low',
}


def generate_scan_report(scan_data: dict, user_data: dict) -> bytes:
    buffer = BytesIO()
    W, H   = A4
    MG     = 18 * mm
    CW     = W - 2 * MG

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=MG, bottomMargin=MG, leftMargin=MG, rightMargin=MG,
        title='DermAssist AI Screening Report',
        author='DermAssist AI Platform',
    )

    def S(**kw):
        return ParagraphStyle('_', fontName='Helvetica', fontSize=9, leading=13, textColor=BRAND_DARK, **kw)

    story = []

    # ── Extract values ────────────────────────────────────────────────────────
    risk       = scan_data.get('risk_level', 'Low Risk')
    dlabel     = scan_data.get('predicted_label', 'nv')
    dname      = NAME_MAP.get(dlabel, dlabel)
    conf       = float(scan_data.get('confidence_score', 0)) * 100
    scan_id    = scan_data.get('id', 0)
    created_at = scan_data.get('created_at', '')
    try:
        dt        = datetime.fromisoformat(str(created_at).replace('Z',''))
        scan_date = dt.strftime('%d %B %Y')
        scan_time = dt.strftime('%I:%M %p')
    except Exception:
        scan_date = str(created_at)[:10] if created_at else 'N/A'
        scan_time = 'N/A'

    now       = datetime.now().strftime('%d %B %Y, %I:%M %p')
    report_id = f'RPT-{str(scan_id).zfill(6)}'
    rcol      = RISK_COLORS.get(risk, BRAND_GRAY)
    rbg       = RISK_BG.get(risk, BRAND_LIGHT)

    raw_scores = {}
    try:
        raw = scan_data.get('raw_output', '{}')
        raw_scores = json.loads(raw) if isinstance(raw, str) else (raw or {})
    except Exception:
        pass

    # ══════════════════════════════════════════════════════════════════════════
    # HEADER BANNER
    # ══════════════════════════════════════════════════════════════════════════
    hdr = Table([[
        Table([[
            Paragraph('DermAssist AI',
                S(fontSize=20, fontName='Helvetica-Bold', textColor=WHITE)),
            Paragraph('AI-Based Skin Lesion Screening Platform',
                S(fontSize=8.5, textColor=colors.HexColor('#bfdbfe'))),
            Paragraph('www.dermassist.ai  |  support@dermassist.ai',
                S(fontSize=7.5, textColor=colors.HexColor('#93c5fd'))),
        ]], colWidths=[105*mm],
        style=TableStyle([('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)])),

        Table([[
            Paragraph('SCREENING REPORT',
                S(fontSize=9, fontName='Helvetica-Bold', textColor=WHITE, alignment=TA_RIGHT)),
            Paragraph(report_id,
                S(fontSize=8, textColor=colors.HexColor('#bfdbfe'), alignment=TA_RIGHT)),
            Paragraph(f'Generated: {now}',
                S(fontSize=7, textColor=colors.HexColor('#93c5fd'), alignment=TA_RIGHT)),
        ]], colWidths=[58*mm],
        style=TableStyle([('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)])),
    ]], colWidths=[105*mm, 58*mm])
    hdr.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), BRAND_BLUE),
        ('TOPPADDING',    (0,0),(-1,-1), 7*mm),
        ('BOTTOMPADDING', (0,0),(-1,-1), 7*mm),
        ('LEFTPADDING',   (0,0),(0,-1),  6*mm),
        ('RIGHTPADDING',  (1,0),(1,-1),  6*mm),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(hdr)
    story.append(Spacer(1, 5*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # PATIENT + SCAN INFO
    # ══════════════════════════════════════════════════════════════════════════
    def icell(lbl, val):
        return Table([
            [Paragraph(lbl, S(fontSize=7, fontName='Helvetica-Bold', textColor=BRAND_GRAY, leading=9))],
            [Paragraph(str(val) if val else '—', S(fontSize=10, fontName='Helvetica-Bold', textColor=BRAND_DARK, leading=13))],
        ], colWidths=[80*mm],
        style=TableStyle([('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))

    info = Table([
        [icell('PATIENT NAME',  user_data.get('full_name')),       icell('SCAN DATE',  scan_date)],
        [icell('EMAIL ADDRESS', user_data.get('email')),           icell('SCAN TIME',  scan_time)],
        [icell('DATE OF BIRTH', user_data.get('date_of_birth')),   icell('GENDER',     user_data.get('gender'))],
        [icell('PHONE NUMBER',  user_data.get('phone_number')),    icell('REPORT ID',  report_id)],
    ], colWidths=[83*mm, 83*mm])
    info.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), BRAND_LIGHT),
        ('BOX',           (0,0),(-1,-1), 0.5, BRAND_BORDER),
        ('INNERGRID',     (0,0),(-1,-1), 0.3, BRAND_BORDER),
        ('TOPPADDING',    (0,0),(-1,-1), 3.5*mm),
        ('BOTTOMPADDING', (0,0),(-1,-1), 3.5*mm),
        ('LEFTPADDING',   (0,0),(-1,-1), 4*mm),
        ('RIGHTPADDING',  (0,0),(-1,-1), 4*mm),
    ]))
    story.append(info)
    story.append(Spacer(1, 4*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # RESULT BANNER
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph('AI ANALYSIS RESULT',
        S(fontSize=11, fontName='Helvetica-Bold', textColor=BRAND_DARK, spaceBefore=4, spaceAfter=3)))

    rl = Table([
        [Paragraph('PRIMARY DIAGNOSIS',  S(fontSize=7, fontName='Helvetica-Bold', textColor=BRAND_GRAY, leading=9))],
        [Paragraph(dname,                S(fontSize=17, fontName='Helvetica-Bold', textColor=BRAND_DARK, leading=22))],
        [Paragraph(f'Code: {dlabel.upper()}', S(fontSize=7.5, textColor=BRAND_GRAY, leading=10))],
        [Spacer(1, 3*mm)],
        [Paragraph('RISK LEVEL',         S(fontSize=7, fontName='Helvetica-Bold', textColor=BRAND_GRAY, leading=9))],
        [Paragraph(risk,                 S(fontSize=14, fontName='Helvetica-Bold', textColor=rcol, leading=18))],
    ], colWidths=[88*mm],
    style=TableStyle([('TOPPADDING',(0,0),(-1,-1),1.5),('BOTTOMPADDING',(0,0),(-1,-1),1.5),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))

    rr = Table([
        [Paragraph('AI CONFIDENCE SCORE', S(fontSize=7, fontName='Helvetica-Bold', textColor=BRAND_GRAY, leading=9, alignment=TA_CENTER))],
        [Paragraph(f'{conf:.1f}%',        S(fontSize=36, fontName='Helvetica-Bold', textColor=BRAND_BLUE, alignment=TA_CENTER, leading=44))],
        [Paragraph('DermAssist v2.0',     S(fontSize=8, textColor=BRAND_GRAY, alignment=TA_CENTER, leading=11))],
        [Paragraph('TFLite · 128×128',    S(fontSize=7.5, textColor=BRAND_GRAY, alignment=TA_CENTER, leading=10))],
    ], colWidths=[70*mm],
    style=TableStyle([('TOPPADDING',(0,0),(-1,-1),1.5),('BOTTOMPADDING',(0,0),(-1,-1),1.5),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))

    res = Table([[rl, rr]], colWidths=[93*mm, 73*mm])
    res.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(0,-1), rbg),
        ('BACKGROUND',    (1,0),(1,-1), BRAND_LIGHT),
        ('BOX',           (0,0),(-1,-1), 1.5, rcol),
        ('LINEAFTER',     (0,0),(0,-1), 0.5, BRAND_BORDER),
        ('TOPPADDING',    (0,0),(-1,-1), 5*mm),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5*mm),
        ('LEFTPADDING',   (0,0),(-1,-1), 5*mm),
        ('RIGHTPADDING',  (0,0),(-1,-1), 5*mm),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(res)
    story.append(Spacer(1, 4*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # ABOUT DIAGNOSIS
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph('ABOUT THIS DIAGNOSIS',
        S(fontSize=11, fontName='Helvetica-Bold', textColor=BRAND_DARK, spaceBefore=4, spaceAfter=3)))
    dbox = Table([[Paragraph(DESCRIPTIONS.get(dlabel,''), S(fontSize=9, leading=14, textColor=colors.HexColor('#374151')))]], colWidths=[CW])
    dbox.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),BRAND_LIGHT),('BOX',(0,0),(-1,-1),0.5,BRAND_BORDER),
        ('TOPPADDING',(0,0),(-1,-1),4*mm),('BOTTOMPADDING',(0,0),(-1,-1),4*mm),
        ('LEFTPADDING',(0,0),(-1,-1),5*mm),('RIGHTPADDING',(0,0),(-1,-1),5*mm),
    ]))
    story.append(dbox)
    story.append(Spacer(1, 4*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # ALL CLASS SCORES
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph('DIFFERENTIAL DIAGNOSIS — ALL CLASS SCORES',
        S(fontSize=11, fontName='Helvetica-Bold', textColor=BRAND_DARK, spaceBefore=4, spaceAfter=3)))

    rows = [[
        Paragraph('CONDITION',  S(fontSize=8, fontName='Helvetica-Bold', textColor=WHITE)),
        Paragraph('CODE',       S(fontSize=8, fontName='Helvetica-Bold', textColor=WHITE)),
        Paragraph('RISK',       S(fontSize=8, fontName='Helvetica-Bold', textColor=WHITE)),
        Paragraph('SCORE %',    S(fontSize=8, fontName='Helvetica-Bold', textColor=WHITE)),
        Paragraph('VISUAL BAR', S(fontSize=8, fontName='Helvetica-Bold', textColor=WHITE)),
    ]]

    rclrs = {'High':RISK_COLORS['High Risk'],'Moderate':RISK_COLORS['Moderate Risk'],'Low':RISK_COLORS['Low Risk']}
    for cls in sorted(['mel','bcc','akiec','bkl','df','vasc','nv'], key=lambda c: raw_scores.get(c,0), reverse=True):
        sc     = raw_scores.get(cls, 0)
        pct    = round(sc * 100, 1)
        rt     = CLASS_RISK.get(cls,'Low')
        rclr   = rclrs.get(rt, BRAND_GRAY)
        is_top = (cls == dlabel)

        bar = Drawing(50*mm, 7)
        bar.add(Rect(0,0,50*mm,7,fillColor=BRAND_BORDER,strokeColor=None))
        bar.add(Rect(0,0,50*mm*sc,7,fillColor=rclr if is_top else colors.HexColor('#93c5fd'),strokeColor=None))

        fn = 'Helvetica-Bold' if is_top else 'Helvetica'
        rows.append([
            Paragraph(NAME_MAP.get(cls,cls), S(fontSize=9,fontName=fn,textColor=BRAND_DARK if is_top else BRAND_GRAY)),
            Paragraph(cls.upper(),           S(fontSize=8,fontName='Helvetica',textColor=BRAND_GRAY)),
            Paragraph(rt,                    S(fontSize=8,fontName='Helvetica-Bold',textColor=rclr)),
            Paragraph(f'{pct}%',             S(fontSize=9,fontName='Helvetica-Bold',textColor=BRAND_BLUE if is_top else BRAND_GRAY)),
            bar,
        ])

    st = Table(rows, colWidths=[52*mm,17*mm,22*mm,22*mm,53*mm])
    st.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),BRAND_DARK),
        ('TOPPADDING',(0,0),(-1,0),3.5*mm),('BOTTOMPADDING',(0,0),(-1,0),3.5*mm),
        ('TOPPADDING',(0,1),(-1,-1),3*mm),('BOTTOMPADDING',(0,1),(-1,-1),3*mm),
        ('LEFTPADDING',(0,0),(-1,-1),3.5*mm),('RIGHTPADDING',(0,0),(-1,-1),3.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,BRAND_LIGHT]),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('BOX',(0,0),(-1,-1),0.5,BRAND_BORDER),
        ('INNERGRID',(0,0),(-1,-1),0.3,BRAND_BORDER),
        ('BACKGROUND',(0,1),(-1,1),colors.HexColor('#eff6ff')),
    ]))
    story.append(st)
    story.append(Spacer(1, 4*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # RECOMMENDATION
    # ══════════════════════════════════════════════════════════════════════════
    story.append(Paragraph('RECOMMENDED ACTION',
        S(fontSize=11, fontName='Helvetica-Bold', textColor=BRAND_DARK, spaceBefore=4, spaceAfter=3)))
    rb = Table([[
        Paragraph('⚕', S(fontSize=22, textColor=rcol, alignment=TA_CENTER)),
        Paragraph(RECOMMENDATIONS.get(risk,''),
            S(fontSize=10, fontName='Helvetica-Bold', textColor=rcol, leading=15)),
    ]], colWidths=[14*mm, CW-14*mm])
    rb.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1),rbg),('BOX',(0,0),(-1,-1),1.5,rcol),
        ('TOPPADDING',(0,0),(-1,-1),5*mm),('BOTTOMPADDING',(0,0),(-1,-1),5*mm),
        ('LEFTPADDING',(0,0),(-1,-1),4*mm),('RIGHTPADDING',(0,0),(-1,-1),4*mm),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ]))
    story.append(rb)
    story.append(Spacer(1, 5*mm))

    # ══════════════════════════════════════════════════════════════════════════
    # FOOTER
    # ══════════════════════════════════════════════════════════════════════════
    story.append(HRFlowable(width=CW, thickness=0.5, color=BRAND_BORDER))
    story.append(Spacer(1, 3*mm))
    ft = Table([[
        Paragraph(
            '<b>DermAssist AI</b> · AI-Based Skin Lesion Screening Platform<br/>'
            'This report is generated by an AI model for <b>screening purposes only</b> and does <b>NOT</b> '
            'constitute a medical diagnosis. Always consult a qualified dermatologist or healthcare professional.',
            S(fontSize=7.5, textColor=BRAND_GRAY, leading=11)
        ),
        Paragraph(
            f'<b>Report Date:</b> {now}<br/><b>Model:</b> DermAssist v2.0<br/><b>Classes:</b> 7 (HAM10000)',
            S(fontSize=7.5, textColor=BRAND_GRAY, alignment=TA_RIGHT, leading=11)
        ),
    ]], colWidths=[115*mm, 51*mm])
    ft.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),
        ('LEFTPADDING',(0,0),(0,-1),0),('RIGHTPADDING',(1,0),(1,-1),0),
    ]))
    story.append(ft)

    doc.build(story)
    return buffer.getvalue()