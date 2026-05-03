package com.aihotel.demo;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

public class MainActivity extends Activity {
    private final List<Ticket> tickets = new ArrayList<>();
    private final List<Staff> staffList = new ArrayList<>();
    private final Map<String, Integer> slaByPriority = new HashMap<>();
    private LinearLayout root;
    private String page = "frontdesk";
    private String frontdeskFilter = "unfinished";
    private String frontdeskSort = "urgency";
    private Staff selectedStaff;

    private final String[] departments = {"housekeeping", "engineering", "frontdesk", "food", "manager"};
    private final String[] priorities = {"low", "normal", "high", "urgent"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        seed();
        render();
    }

    private void seed() {
        slaByPriority.put("low", 45);
        slaByPriority.put("normal", 30);
        slaByPriority.put("high", 15);
        slaByPriority.put("urgent", 8);

        staffList.add(new Staff("hk-lin", "林阿姨", "housekeeping", "楼层服务员"));
        staffList.add(new Staff("hk-chen", "陈主管", "housekeeping", "客房主管"));
        staffList.add(new Staff("eng-wang", "王师傅", "engineering", "工程维修"));
        staffList.add(new Staff("food-zhao", "赵领班", "food", "餐饮领班"));
        staffList.add(new Staff("fd-qin", "秦前台", "frontdesk", "前台接待"));
        staffList.add(new Staff("mgr-he", "何经理", "manager", "值班经理"));
        selectedStaff = staffList.get(0);

        long now = System.currentTimeMillis();
        tickets.add(new Ticket("1208", "需要两条浴巾和两瓶矿泉水", "housekeeping", "ai_call", "pending", "normal", null, null, now - min(8), null, null, now + min(22)));
        tickets.add(new Ticket("1602", "空调不制冷，客人要求尽快维修", "engineering", "ai_call", "processing", "high", "eng-wang", "王师傅", now - min(18), now - min(14), null, now - min(3)));
        tickets.add(new Ticket("0906", "要求开具公司抬头发票", "frontdesk", "frontdesk", "completed", "normal", "fd-qin", "秦前台", now - min(55), now - min(49), now - min(32), now - min(25)));
        tickets.add(new Ticket("2101", "隔壁噪音严重，客人要求经理处理", "manager", "ai_call", "timeout", "high", null, null, now - min(35), null, null, now - min(20)));
        tickets.add(new Ticket("1105", "需要补充两瓶矿泉水和一套洗漱用品", "housekeeping", "frontdesk", "pending", "low", null, null, now - min(1), null, null, now + min(525600)));
        tickets.add(new Ticket("1310", "客人需要加送一个枕头和一条浴巾", "housekeeping", "frontdesk", "pending", "low", null, null, now - min(2), null, null, now + min(525600)));
    }

    private void render() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(14), dp(14), dp(14), dp(24));
        root.setBackgroundColor(Color.rgb(247, 241, 231));
        scroll.addView(root);
        setContentView(scroll);

        addHeader();
        if ("frontdesk".equals(page)) renderFrontdesk();
        if ("staff".equals(page)) renderStaff();
        if ("manager".equals(page)) renderManager();
        if ("ai".equals(page)) renderAiCall();
    }

    private void addHeader() {
        TextView title = text("AIHOTEL 酒店客需工单 Demo", 24, Color.rgb(15, 23, 42), true);
        root.addView(title);
        root.addView(text("前台看板 / 员工接单 / 主管统计 / AI 来电模拟", 13, Color.rgb(80, 90, 105), false));

        HorizontalScrollView hsv = new HorizontalScrollView(this);
        LinearLayout nav = row();
        nav.setPadding(0, dp(12), 0, dp(12));
        nav.addView(navButton("前台看板", "frontdesk"));
        nav.addView(navButton("员工端", "staff"));
        nav.addView(navButton("主管看板", "manager"));
        nav.addView(navButton("AI 来电", "ai"));
        hsv.addView(nav);
        root.addView(hsv);
    }

    private Button navButton(String label, String target) {
        Button b = button(label, "primary");
        b.setAlpha(page.equals(target) ? 1f : 0.72f);
        b.setOnClickListener(v -> {
            page = target;
            render();
        });
        return b;
    }

    private void renderFrontdesk() {
        root.addView(sectionTitle("前台实时客需看板"));
        LinearLayout kpis = rowWrap();
        kpis.addView(kpi("未完成", count(t -> !isClosed(t)), "slate", "unfinished"));
        kpis.addView(kpi("未接单", count(t -> !isClosed(t) && isUnaccepted(t)), "amber", "unaccepted"));
        kpis.addView(kpi("已接单", count(t -> !isClosed(t) && isAccepted(t)), "blue", "accepted"));
        kpis.addView(kpi("已完成", count(t -> "completed".equals(t.status)), "gray", "completed"));
        kpis.addView(kpi("已超时", count(t -> !isClosed(t) && isOverdue(t)), "red", "timeout"));
        root.addView(kpis);

        LinearLayout toolbar = card();
        toolbar.addView(text("当前筛选：" + filterLabel(frontdeskFilter), 18, Color.rgb(15, 23, 42), true));
        Spinner sortSpinner = spinner(new String[]{"紧要优先", "最新优先", "最早优先"});
        sortSpinner.setSelection("newest".equals(frontdeskSort) ? 1 : "oldest".equals(frontdeskSort) ? 2 : 0);
        sortSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String next = position == 1 ? "newest" : position == 2 ? "oldest" : "urgency";
                if (!frontdeskSort.equals(next)) {
                    frontdeskSort = next;
                    render();
                }
            }

            public void onNothingSelected(AdapterView<?> parent) {}
        });
        toolbar.addView(sortSpinner);
        root.addView(toolbar);

        List<Ticket> visible = filteredTickets();
        if (visible.isEmpty()) {
            root.addView(empty("当前筛选下暂无工单"));
            return;
        }
        for (Ticket t : visible) root.addView(ticketCard(t, false, null));
    }

    private View kpi(String label, int value, String tone, String filter) {
        LinearLayout box = card();
        box.setMinimumWidth(dp(112));
        box.setOnClickListener(v -> {
            frontdeskFilter = filter;
            if ("timeout".equals(filter)) frontdeskSort = "oldest";
            render();
        });
        TextView l = text(label, 13, Color.rgb(85, 95, 110), true);
        TextView v = text(String.valueOf(value), 32, toneColor(tone), true);
        box.addView(l);
        box.addView(v);
        if (frontdeskFilter.equals(filter)) box.setBackground(cardBg(Color.WHITE, Color.rgb(15, 23, 42), 2));
        return box;
    }

    private void renderStaff() {
        root.addView(sectionTitle("员工接单"));
        LinearLayout selector = card();
        selector.addView(text("选择员工身份", 16, Color.rgb(15, 23, 42), true));
        Spinner spinner = spinner(staffNames());
        spinner.setSelection(Math.max(0, staffList.indexOf(selectedStaff)));
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedStaff = staffList.get(position);
            }

            public void onNothingSelected(AdapterView<?> parent) {}
        });
        selector.addView(spinner);
        root.addView(selector);

        root.addView(text("当前：" + selectedStaff.name + " / " + dept(selectedStaff.department), 16, Color.rgb(15, 23, 42), true));
        root.addView(sectionTitle("待接单"));
        boolean anyPending = false;
        for (Ticket t : tickets) {
            if (!isClosed(t) && isUnaccepted(t) && t.department.equals(selectedStaff.department)) {
                anyPending = true;
                root.addView(ticketCard(t, true, "accept"));
            }
        }
        if (!anyPending) root.addView(empty("暂无待接单"));

        root.addView(sectionTitle("我的处理中"));
        boolean anyProcessing = false;
        for (Ticket t : tickets) {
            if (!isClosed(t) && selectedStaff.id.equals(t.assigneeId)) {
                anyProcessing = true;
                root.addView(ticketCard(t, true, "complete"));
            }
        }
        if (!anyProcessing) root.addView(empty("暂无处理中"));
    }

    private void renderManager() {
        root.addView(sectionTitle("主管运营看板"));
        LinearLayout kpis = rowWrap();
        kpis.addView(simpleKpi("总单", tickets.size()));
        kpis.addView(simpleKpi("未完成", count(t -> !isClosed(t))));
        kpis.addView(simpleKpi("超时", count(t -> !isClosed(t) && isOverdue(t))));
        kpis.addView(simpleKpi("已完成", count(t -> "completed".equals(t.status))));
        root.addView(kpis);

        root.addView(sectionTitle("员工完成排行"));
        for (Staff s : staffList) {
            int done = count(t -> s.id.equals(t.assigneeId) && "completed".equals(t.status));
            if (done > 0) root.addView(text(s.name + " / " + dept(s.department) + "：完成 " + done + " 单", 16, Color.rgb(15, 23, 42), true));
        }

        root.addView(sectionTitle("超时工单"));
        boolean any = false;
        for (Ticket t : tickets) {
            if (!isClosed(t) && isOverdue(t)) {
                any = true;
                root.addView(ticketCard(t, false, null));
            }
        }
        if (!any) root.addView(empty("暂无超时工单"));
    }

    private void renderAiCall() {
        root.addView(sectionTitle("AI 来电模拟"));
        root.addView(text("当前 Demo 使用文本模拟电话转写。真实落地可接讯飞、阿里云、腾讯云等语音转写系统。", 14, Color.rgb(80, 90, 105), false));

        EditText input = new EditText(this);
        input.setMinLines(4);
        input.setGravity(Gravity.TOP);
        input.setText("我是1602房，空调不制冷，麻烦马上安排维修。");
        input.setBackground(cardBg(Color.WHITE, Color.rgb(220, 220, 220), 1));
        input.setPadding(dp(12), dp(10), dp(12), dp(10));
        root.addView(input, matchWrap());

        LinearLayout examples = rowWrap();
        String[] sampleTexts = {
                "我是1208房，麻烦送两条浴巾和两瓶矿泉水。",
                "我是1602房，空调不制冷，麻烦马上安排维修。",
                "我是608房，需要开发票，顺便帮我叫车。",
                "我是706房，早餐想送到房间，再要一杯咖啡。",
                "我是1003房，隔壁噪音严重，我要投诉找经理。"
        };
        for (int i = 0; i < sampleTexts.length; i++) {
            final String sample = sampleTexts[i];
            Button b = button("示例" + (i + 1), "outline");
            b.setOnClickListener(v -> input.setText(sample));
            examples.addView(b);
        }
        root.addView(examples);

        Button parse = button("识别并生成工单", "primary");
        parse.setOnClickListener(v -> {
            Ticket t = parseCall(input.getText().toString());
            tickets.add(0, t);
            Toast.makeText(this, "已生成 " + t.room + " 房工单", Toast.LENGTH_SHORT).show();
            page = "frontdesk";
            render();
        });
        root.addView(parse);
    }

    private Ticket parseCall(String text) {
        String room = "未知";
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(?:房间|房号|我是|我住)?\\s*(\\d{3,4})\\s*(?:房|房间)?").matcher(text);
        if (matcher.find()) room = matcher.group(1);

        String department = "frontdesk";
        if (containsAny(text, "空调", "漏水", "马桶", "电视", "灯", "电", "热水", "维修", "坏", "堵")) department = "engineering";
        else if (containsAny(text, "毛巾", "浴巾", "矿泉水", "牙刷", "拖鞋", "被子", "枕头", "纸巾", "打扫", "清洁")) department = "housekeeping";
        else if (containsAny(text, "早餐", "晚餐", "送餐", "餐", "咖啡", "牛奶")) department = "food";
        else if (containsAny(text, "投诉", "赔偿", "吵", "噪音", "不满意", "经理", "严重")) department = "manager";

        String priority = "normal";
        if (containsAny(text, "着火", "火灾", "受伤", "晕倒", "报警")) priority = "urgent";
        else if (containsAny(text, "马上", "立刻", "急", "严重", "投诉") || "engineering".equals(department) || "manager".equals(department)) priority = "high";

        long now = System.currentTimeMillis();
        long due = now + min(slaByPriority.get(priority));
        String summary = text.replace("您好", "").replace("你好", "").trim();
        if (summary.length() > 48) summary = summary.substring(0, 48);
        return new Ticket(room, summary, department, "ai_call", "pending", priority, null, null, now, null, null, due);
    }

    private View ticketCard(Ticket t, boolean actions, String actionType) {
        boolean overdue = isOverdue(t);
        int bg = Color.WHITE;
        int border = Color.rgb(220, 220, 220);
        int bar = Color.rgb(217, 144, 47);
        if ("completed".equals(t.status)) {
            bg = Color.rgb(241, 245, 249);
            bar = Color.rgb(148, 163, 184);
        } else if (overdue) {
            bg = Color.rgb(254, 242, 242);
            border = Color.rgb(248, 113, 113);
            bar = Color.rgb(220, 38, 38);
        } else if (isUnaccepted(t)) {
            bg = Color.rgb(255, 251, 235);
            border = Color.rgb(252, 211, 77);
            bar = Color.rgb(217, 119, 6);
        } else {
            bg = Color.rgb(239, 246, 255);
            border = Color.rgb(147, 197, 253);
            bar = Color.rgb(37, 99, 235);
        }

        LinearLayout card = card();
        card.setBackground(cardBg(bg, border, 1));
        LinearLayout top = row();
        TextView room = pill(t.room, bar, Color.WHITE);
        top.addView(room);
        top.addView(pill(statusLabel(t, overdue), overdue ? Color.rgb(220, 38, 38) : bar, Color.WHITE));
        top.addView(pill(priorityLabel(t.priority), Color.rgb(15, 23, 42), Color.WHITE));
        card.addView(top);
        card.addView(text(t.request, 18, Color.rgb(15, 23, 42), true));
        card.addView(text("部门：" + dept(t.department) + "  负责人：" + (t.assigneeName == null ? "未接单" : t.assigneeName), 14, Color.rgb(71, 85, 105), false));
        card.addView(text("等待：" + minutesSince(t.createdAt) + " 分钟  来源：" + ("ai_call".equals(t.source) ? "AI 来电" : "人工录入"), 14, Color.rgb(71, 85, 105), false));

        if (actions) {
            Button b = button("accept".equals(actionType) ? "接单" : "完成", "primary");
            b.setOnClickListener(v -> {
                if ("accept".equals(actionType)) {
                    t.status = "processing";
                    t.assigneeId = selectedStaff.id;
                    t.assigneeName = selectedStaff.name;
                    t.acceptedAt = System.currentTimeMillis();
                    Toast.makeText(this, "已接单", Toast.LENGTH_SHORT).show();
                } else {
                    t.status = "completed";
                    t.completedAt = System.currentTimeMillis();
                    Toast.makeText(this, "已完成", Toast.LENGTH_SHORT).show();
                }
                render();
            });
            card.addView(b);
        }
        return card;
    }

    private List<Ticket> filteredTickets() {
        List<Ticket> list = new ArrayList<>();
        for (Ticket t : tickets) {
            if ("unfinished".equals(frontdeskFilter) && isClosed(t)) continue;
            if ("unaccepted".equals(frontdeskFilter) && (isClosed(t) || !isUnaccepted(t))) continue;
            if ("accepted".equals(frontdeskFilter) && (isClosed(t) || !isAccepted(t))) continue;
            if ("completed".equals(frontdeskFilter) && !"completed".equals(t.status)) continue;
            if ("timeout".equals(frontdeskFilter) && (isClosed(t) || !isOverdue(t))) continue;
            list.add(t);
        }
        Collections.sort(list, (a, b) -> compare(a, b));
        return list;
    }

    private int compare(Ticket a, Ticket b) {
        if ("newest".equals(frontdeskSort)) return Long.compare(b.createdAt, a.createdAt);
        if ("oldest".equals(frontdeskSort)) return Long.compare(a.createdAt, b.createdAt);
        int overdue = Boolean.compare(isOverdue(b), isOverdue(a));
        if (overdue != 0) return overdue;
        return Long.compare(a.createdAt, b.createdAt);
    }

    private boolean isClosed(Ticket t) {
        return "completed".equals(t.status) || "cancelled".equals(t.status);
    }

    private boolean isUnaccepted(Ticket t) {
        return t.assigneeId == null && t.assigneeName == null;
    }

    private boolean isAccepted(Ticket t) {
        return t.assigneeId != null || t.assigneeName != null;
    }

    private boolean isOverdue(Ticket t) {
        return !"completed".equals(t.status) && !"cancelled".equals(t.status) && ("timeout".equals(t.status) || System.currentTimeMillis() > t.dueAt);
    }

    private boolean containsAny(String text, String... words) {
        for (String word : words) if (text.contains(word)) return true;
        return false;
    }

    private int count(Filter filter) {
        int n = 0;
        for (Ticket t : tickets) if (filter.match(t)) n++;
        return n;
    }

    private String[] staffNames() {
        String[] names = new String[staffList.size()];
        for (int i = 0; i < staffList.size(); i++) names[i] = staffList.get(i).name + " / " + dept(staffList.get(i).department);
        return names;
    }

    private View simpleKpi(String label, int value) {
        LinearLayout box = card();
        box.setMinimumWidth(dp(92));
        box.addView(text(label, 13, Color.rgb(85, 95, 110), true));
        box.addView(text(String.valueOf(value), 28, Color.rgb(15, 23, 42), true));
        return box;
    }

    private String filterLabel(String filter) {
        if ("unaccepted".equals(filter)) return "未接单";
        if ("accepted".equals(filter)) return "已接单";
        if ("completed".equals(filter)) return "已完成";
        if ("timeout".equals(filter)) return "已超时";
        return "未完成";
    }

    private String statusLabel(Ticket t, boolean overdue) {
        if (overdue) return "已超时";
        if ("pending".equals(t.status)) return "待接单";
        if ("processing".equals(t.status)) return "处理中";
        if ("completed".equals(t.status)) return "已完成";
        return t.status;
    }

    private String priorityLabel(String priority) {
        if ("urgent".equals(priority)) return "紧急";
        if ("high".equals(priority)) return "加急";
        if ("low".equals(priority)) return "低";
        return "普通";
    }

    private String dept(String id) {
        if ("housekeeping".equals(id)) return "客房部";
        if ("engineering".equals(id)) return "工程部";
        if ("frontdesk".equals(id)) return "前台";
        if ("food".equals(id)) return "餐饮部";
        if ("manager".equals(id)) return "主管";
        return id;
    }

    private TextView sectionTitle(String s) {
        TextView v = text(s, 22, Color.rgb(15, 23, 42), true);
        v.setPadding(0, dp(16), 0, dp(8));
        return v;
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView v = new TextView(this);
        v.setText(s);
        v.setTextSize(sp);
        v.setTextColor(color);
        v.setPadding(0, dp(3), 0, dp(3));
        if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return v;
    }

    private TextView pill(String s, int bg, int fg) {
        TextView v = text(s, 13, fg, true);
        v.setPadding(dp(10), dp(6), dp(10), dp(6));
        v.setBackground(round(bg, dp(14)));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(0, 0, dp(8), dp(8));
        v.setLayoutParams(lp);
        return v;
    }

    private Button button(String label, String tone) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextSize(14);
        b.setTextColor("outline".equals(tone) ? Color.rgb(15, 23, 42) : Color.WHITE);
        b.setBackground(cardBg("outline".equals(tone) ? Color.WHITE : Color.rgb(18, 50, 74), Color.rgb(18, 50, 74), 1));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44));
        lp.setMargins(0, 0, dp(8), dp(8));
        b.setLayoutParams(lp);
        return b;
    }

    private Spinner spinner(String[] items) {
        Spinner spinner = new Spinner(this);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, items);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setPadding(0, dp(4), 0, dp(4));
        return spinner;
    }

    private LinearLayout card() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setPadding(dp(14), dp(12), dp(14), dp(12));
        l.setBackground(cardBg(Color.WHITE, Color.rgb(235, 228, 216), 1));
        LinearLayout.LayoutParams lp = matchWrap();
        lp.setMargins(0, 0, 0, dp(12));
        l.setLayoutParams(lp);
        return l;
    }

    private LinearLayout row() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.HORIZONTAL);
        l.setGravity(Gravity.CENTER_VERTICAL);
        return l;
    }

    private LinearLayout rowWrap() {
        LinearLayout l = row();
        l.setPadding(0, 0, 0, dp(8));
        return l;
    }

    private View empty(String s) {
        LinearLayout l = card();
        TextView v = text(s, 16, Color.rgb(100, 116, 139), true);
        v.setGravity(Gravity.CENTER);
        l.addView(v);
        return l;
    }

    private GradientDrawable cardBg(int color, int stroke, int strokeWidth) {
        GradientDrawable d = round(color, dp(18));
        d.setStroke(dp(strokeWidth), stroke);
        return d;
    }

    private GradientDrawable round(int color, int radius) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(radius);
        return d;
    }

    private int toneColor(String tone) {
        if ("red".equals(tone)) return Color.rgb(220, 38, 38);
        if ("amber".equals(tone)) return Color.rgb(217, 119, 6);
        if ("blue".equals(tone)) return Color.rgb(29, 78, 216);
        if ("gray".equals(tone)) return Color.rgb(100, 116, 139);
        return Color.rgb(15, 23, 42);
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private long min(int n) {
        return n * 60_000L;
    }

    interface Filter {
        boolean match(Ticket t);
    }

    static class Staff {
        String id;
        String name;
        String department;
        String role;

        Staff(String id, String name, String department, String role) {
            this.id = id;
            this.name = name;
            this.department = department;
            this.role = role;
        }
    }

    static class Ticket {
        String id = UUID.randomUUID().toString();
        String room;
        String request;
        String department;
        String source;
        String status;
        String priority;
        String assigneeId;
        String assigneeName;
        long createdAt;
        Long acceptedAt;
        Long completedAt;
        long dueAt;

        Ticket(String room, String request, String department, String source, String status, String priority, String assigneeId, String assigneeName, long createdAt, Long acceptedAt, Long completedAt, long dueAt) {
            this.room = room;
            this.request = request;
            this.department = department;
            this.source = source;
            this.status = status;
            this.priority = priority;
            this.assigneeId = assigneeId;
            this.assigneeName = assigneeName;
            this.createdAt = createdAt;
            this.acceptedAt = acceptedAt;
            this.completedAt = completedAt;
            this.dueAt = dueAt;
        }
    }
}
