# جریان کاری گیت و دیپلوی (پیشنهادی)

## ساختار شاخه‌ها
- main: کد پایدار و آماده انتشار
- develop: ادغام و تست قبل از انتشار
- feature/*: شاخه‌های کوتاه‌مدت برای هر تغییر (مثلاً feature/docker-setup)
- hotfix/*: رفع فوری از main
- release/x.y.z (اختیاری): تثبیت قبل از انتشار

## قوانین ساده
- محافظت از main: بدون push مستقیم، فقط merge با Pull Request
- عدم قرار دادن فایل‌های راز: `.env` و کلیدها را هرگز push نکن؛ فقط `.env.example`
- هر تغییر با PR → تست → بررسی → Merge

## دستورات کلیدی (Windows/PowerShell)
```powershell
# ایجاد develop و پوش اولیه
git checkout -b develop
git push -u origin develop

# ایجاد شاخه فیچر برای داکر
git checkout -b feature/docker-setup
# اعمال تغییرات، سپس:
git add -A
git commit -m "Docker: compose, Dockerfiles, nginx, env production"
git push -u origin feature/docker-setup

# ساخت Pull Request از feature/docker-setup به develop در GitHub

# ادغام develop به main با PR زمانی که آماده انتشار است
# (از طریق UI انجام بده)
```

## دستورات کلیدی (Linux/Bash)
```bash
# دریافت آخرین وضعیت شاخه‌ها
git fetch --all

# سوئیچ به develop
git checkout develop

# ادغام فیچر در develop (پس از PR)
# (از طریق UI GitHub)

# ادغام develop به main با PR (پس از تایید)
# (از طریق UI GitHub)

# تگ انتشار (اختیاری)
git tag v0.1.0
git push origin v0.1.0
```

## تست و CI پیشنهادی
- روی PR به develop:
  - اجرای اعتبارسنجی Compose: `docker compose config`
  - چک جنگو: `python manage.py check` (داخل کانتینر backend)
  - اجرای تست‌ها در صورت وجود
- روی Merge به main:
  - Build ایمیج‌ها
  - آماده‌سازی دیپلوی یا انتشار Tag

## دیپلوی امن
- روی سرور، کنار `docker-compose.yml` فایل `.env` قرار بده (حاوی مقادیر واقعی، بدون push شدن به Git):
- دستورات:
```bash
cd /root/opt/konkor-project
# پاک‌سازی ایمن و ساخت مجدد
docker compose down -v
docker compose up -d --build

# بررسی وضعیت
docker compose ps
docker compose logs db --tail=200

# سلامت بک‌اند
curl http://89.42.199.69/api/health/

# فرانت از طریق NGINX
curl -I http://89.42.199.69
```

## نکات Postgres و امنیت
- استفاده از `POSTGRES_DB/USER/PASSWORD` در Compose برای سرویس db
- عدم استفاده از trust در تولید (بدون رمز)
- Healthcheck دقیق:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## نکات فرانت و بک‌اند
- SSR فرانت: `INTERNAL_API_URL=http://backend:8000` برای اتصال داخلی سریع
- کلاینت: `NEXT_PUBLIC_API_URL=http://89.42.199.69` برای دسترسی از طریق NGINX
- بدون blog-api: `NEXT_PUBLIC_STRAPI_API_URL=` خالی؛ فراخوانی‌های بلاگ در فرانت gracefully غیرفعال می‌شوند

## فایروال و پورت‌ها
- باز: `80` (NGINX)، و در صورت نیاز `3000` (فرانت مستقیم)
- ترجیحاً نبند/باز نکن: `8000` و `5432` به بیرون؛ فقط داخلی در شبکه داکر

## یادآوری امنیتی
- مقدار `SECRET_KEY` را در تولید به یک کلید تصادفی امن تغییر بده
- فایل‌های `.env` را هرگز در مخزن قرار نده؛ فقط نمونه‌ی `.env.example` نگه‌داری شود
