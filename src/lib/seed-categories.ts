import { prisma } from '@/lib/prisma'

const defaultCategories = [
  { name: 'Food & Dining', color: '#10B981', icon: 'Utensils' },
  { name: 'Transportation', color: '#3B82F6', icon: 'Car' },
  { name: 'Shopping', color: '#8B5CF6', icon: 'ShoppingBag' },
  { name: 'Entertainment', color: '#F59E0B', icon: 'Film' },
  { name: 'Healthcare', color: '#EF4444', icon: 'Heart' },
  { name: 'Utilities', color: '#06B6D4', icon: 'Zap' },
  { name: 'Housing', color: '#84CC16', icon: 'Home' },
  { name: 'Education', color: '#EC4899', icon: 'GraduationCap' },
  { name: 'Travel', color: '#F97316', icon: 'Plane' },
  { name: 'Insurance', color: '#6366F1', icon: 'Shield' },
  { name: 'Investment', color: '#22C55E', icon: 'TrendingUp' },
  { name: 'Salary', color: '#10B981', icon: 'DollarSign' },
  { name: 'Freelance', color: '#3B82F6', icon: 'Briefcase' },
  { name: 'Gifts', color: '#8B5CF6', icon: 'Gift' },
  { name: 'Subscriptions', color: '#F59E0B', icon: 'Repeat' },
  { name: 'Services', color: '#14B8A6', icon: 'Wrench' },
  { name: 'Technology', color: '#6366F1', icon: 'Smartphone' },
  { name: 'Business', color: '#F59E0B', icon: 'Briefcase' },
  { name: 'Personal Care', color: '#EC4899', icon: 'Scissors' },
  { name: 'Fitness', color: '#10B981', icon: 'Dumbbell' },
  { name: 'Pets', color: '#F97316', icon: 'Heart' },
  { name: 'Charity', color: '#EF4444', icon: 'Heart' },
  { name: 'Legal', color: '#8B5CF6', icon: 'Scale' },
  { name: 'Taxes', color: '#F59E0B', icon: 'FileText' },
]

export async function seedCategories(userId: string) {
  try {
    // Check if user already has categories
    const existingCategories = await prisma.category.findMany({
      where: { userId },
    })

    if (existingCategories.length > 0) {
      console.log('User already has categories, skipping seed')
      return existingCategories
    }

    // Create default categories for the user
    const categories = await Promise.all(
      defaultCategories.map((category) =>
        prisma.category.create({
          data: {
            name: category.name,
            color: category.color,
            icon: category.icon,
            userId,
          },
        })
      )
    )

    console.log(
      `Created ${categories.length} default categories for user ${userId}`
    )
    return categories
  } catch (error) {
    console.error('Error seeding categories:', error)
    throw error
  }
}
