import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Calendar, TrendingUp, Target, BookOpen, Brain, CheckCircle2, ArrowLeft } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">برنامه‌ریز هوشمند</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">ورود</Button>
            </Link>
            <Link href="/register">
              <Button>ثبت‌نام رایگان</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>تحلیل داده، برنامه‌ریزی دقیق، نتیجه تضمینی</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="text-primary">هوش مصنوعی</span> مشاور کنکور
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              با بررسی هزاران مسیر موفق، برنامه‌ای اختصاصی برایت می‌سازد تا هر ساعت مطالعه‌ات بیشترین بازده را داشته باشد.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  شروع رایگان
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  مشاهده نمونه
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">امکانات برنامه‌ریز هوشمند</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ابزارهای پیشرفته برای برنامه‌ریزی دقیق و موثر مطالعه
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "برنامه‌ریزی با هوش مصنوعی",
                description: "برنامه مطالعه شخصی‌سازی شده بر اساس نقاط قوت و ضعف شما",
              },
              {
                icon: Calendar,
                title: "برنامه روزانه و هفتگی",
                description: "مدیریت زمان با دقت برای بهترین استفاده از ساعات مطالعه",
              },
              {
                icon: TrendingUp,
                title: "تحلیل پیشرفت",
                description: "نمودارها و گزارش‌های دقیق از روند پیشرفت شما",
              },
              {
                icon: Target,
                title: "هدف‌گذاری هوشمند",
                description: "تعیین اهداف واقع‌بینانه و قابل دستیابی",
              },
              {
                icon: BookOpen,
                title: "مدیریت منابع درسی",
                description: "سازماندهی و پیگیری تمام منابع و کتاب‌های درسی",
              },
              {
                icon: CheckCircle2,
                title: "پیگیری آزمون‌ها",
                description: "یادآوری و آماده‌سازی برای آزمون‌های آزمایشی",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">چگونه کار می‌کند؟</h2>
            <p className="text-lg text-muted-foreground">سه قدم ساده تا برنامه مطالعه حرفه‌ای</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "۱",
                title: "ثبت‌نام و ورود اطلاعات",
                description: "پایه تحصیلی، رشته و وضعیت فعلی مطالعه خود را وارد کنید",
              },
              {
                step: "۲",
                title: "دریافت برنامه هوشمند",
                description: "هوش مصنوعی برنامه شخصی‌سازی شده‌ای برای شما طراحی می‌کند",
              },
              {
                step: "۳",
                title: "مطالعه و پیشرفت",
                description: "با پیگیری روزانه و تحلیل پیشرفت، به اهداف خود برسید",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">نظرات دانش‌آموزان</h2>
            <p className="text-lg text-muted-foreground">داستان موفقیت کنکوری‌ها</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "سارا احمدی",
                rank: "رتبه ۱۲۳ تجربی",
                text: "برنامه‌ریزی هوشمند کمک کرد تا منظم مطالعه کنم و به رتبه دلخواهم برسم.",
              },
              {
                name: "امیرحسین رضایی",
                rank: "رتبه ۸۹ ریاضی",
                text: "تحلیل پیشرفت و نمودارها بهترین راهنما برای تشخیص نقاط ضعف من بودند.",
              },
              {
                name: "فاطمه کریمی",
                rank: "رتبه ۲۵۶ انسانی",
                text: "با این برنامه‌ریز، برای اولین بار احساس کردم کنترل کامل روی مطالعه‌ام دارم.",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.rank}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">همین الان شروع کنید</h2>
            <p className="text-lg text-muted-foreground mb-8">
              رایگان ثبت‌نام کنید و برنامه مطالعه هوشمند خود را دریافت کنید
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-12">
                شروع رایگان
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold">برنامه‌ریز هوشمند</span>
              </div>
              <p className="text-sm text-muted-foreground">راه حل هوشمند برای موفقیت در کنکور</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">محصولات</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    برنامه‌ریزی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    تحلیل پیشرفت
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    آزمون‌های آزمایشی
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">پشتیبانی</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    راهنما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    تماس با ما
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    سوالات متداول
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">قانونی</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    حریم خصوصی
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    شرایط استفاده
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© ۱۴۰۳ برنامه‌ریز هوشمند. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
