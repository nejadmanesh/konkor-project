import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StudentState {
  name: string
  grade: string
  field: string
  dailyHours: number
  phone: string
  address: string
  birthdateJalali: string
  profileCompleted: boolean
  avatarUrl: string
  setStudent: (data: Partial<StudentState>) => void
  logout: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      name: "",
      grade: "",
      field: "",
      dailyHours: 0,
      phone: "",
      address: "",
      birthdateJalali: "",
      profileCompleted: false,
      avatarUrl: "",
      setStudent: (data) => set((state) => ({ ...state, ...data })),
      logout: () =>
        set(() => ({
          name: "",
          grade: "",
          field: "",
          dailyHours: 0,
          phone: "",
          address: "",
          birthdateJalali: "",
          profileCompleted: false,
          avatarUrl: "",
        })),
    }),
    { name: "student-store" },
  ),
)
