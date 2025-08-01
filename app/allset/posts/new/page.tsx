'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiUpload, FiLink, FiFileText, FiRefreshCw } from 'react-icons/fi'
import { generateFromText, generateFromPdf, generateFromUrl } from './generators'

// Component that uses useSearchParams
function NewPostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initializedRef = useRef(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    tags: '',
    authors: '',
    draft: false,
    summary: '',
    content: '',
  })

  // State for content generation
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')

  // Initialize form data from query parameters and sessionStorage if available
  useEffect(() => {
    // Prevent re-initialization if already done
    if (initializedRef.current) return

    const title = searchParams.get('title')
    const summary = searchParams.get('summary')
    const hasContent = searchParams.get('hasContent')
    const directContent = searchParams.get('content') // For small content passed directly
    const tags = searchParams.get('tags') // Get tags as comma-separated string

    if (!title) return

    // Mark as initialized to prevent re-runs
    initializedRef.current = true

    console.log('Initializing form with:', {
      title,
      summary,
      tags: tags || 'none',
      hasContent: hasContent === 'true',
      directContent: directContent ? 'yes, length: ' + directContent.length : 'no',
    })

    // Generate slug from title
    const slug = generateSlug(title)

    // Initialize with title, summary, and tags
    const newFormData = {
      ...formData,
      title,
      slug,
      summary: summary || formData.summary,
      tags: tags || formData.tags, // Add tags from URL parameters
    }

    // If content is passed directly in URL, use it
    if (directContent) {
      // No need to clean JSON here - it's already cleaned in the API endpoint
      newFormData.content = directContent
    }

    // Always set the basic form data first (title, slug, summary)
    setFormData(newFormData)

    // Log the form data after setting it
    console.log('Form data set to:', newFormData)

    // If hasContent flag is set, try to get content from storage
    if (hasContent === 'true') {
      try {
        // Add a small delay to ensure storage is available after navigation
        setTimeout(() => {
          try {
            // Try to get content from sessionStorage first
            let storedContent = sessionStorage.getItem('generatedBlogContent')

            // If not in sessionStorage, try localStorage
            if (!storedContent) {
              console.log('Content not found in sessionStorage, trying localStorage')
              storedContent = localStorage.getItem('generatedBlogContent')
            }

            console.log(
              'Retrieved content:',
              storedContent ? 'yes, length: ' + storedContent.length : 'no'
            )

            if (storedContent) {
              // No need to clean JSON here - it's already cleaned in the API endpoint

              // Update only the content field, preserving other fields
              setFormData((prevData) => ({
                ...prevData, // Keep existing data (title, slug, summary, etc.)
                content: storedContent || '',
              }))

              // Clear the stored content after retrieving it
              sessionStorage.removeItem('generatedBlogContent')
              localStorage.removeItem('generatedBlogContent')
            }
          } catch (innerError) {
            console.error('Failed to retrieve content from storage:', innerError)
          }
        }, 200)
      } catch (error) {
        console.error('Failed to access storage:', error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      // Handle checkbox input
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      // Handle text inputs
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/-+$/, '') // Remove trailing hyphens
      .trim()
  }

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const hyphenatedSlug = generateSlug(title)
    setFormData((prev) => ({
      ...prev,
      title,
      slug: hyphenatedSlug,
    }))
  }

  // Generate blog content from text input
  const handleGenerateFromText = () => {
    generateFromText({
      text: textInput,
      setIsGenerating,
      setGenerationError,
      setFormData,
      generateSlug,
    })
  }

  // Generate blog content from URL
  const handleGenerateFromUrl = () => {
    generateFromUrl({
      url: urlInput,
      setIsGenerating,
      setGenerationError,
      setFormData,
      generateSlug,
    })
  }

  // Generate blog content from PDF
  const handleGenerateFromPdf = () => {
    generateFromPdf({
      pdfFile,
      setIsGenerating,
      setGenerationError,
      setFormData,
      generateSlug,
    })
  }

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf') {
        setPdfFile(file)
        setGenerationError('')
      } else {
        setGenerationError('Please upload a PDF file')
        setPdfFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setError('')
    setSuccess('')
    setError('')
    setSuccess('')

    try {
      // Prepare the data
      const postData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        authors: formData.authors
          .split(',')
          .map((author) => author.trim())
          .filter(Boolean),
      }

      // Send the request
      const response = await fetch('/api/allset/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create post')
      }

      const data = await response.json()

      setSuccess('Post created successfully!')

      // Redirect to the edit page after a short delay
      setTimeout(() => {
        router.push(`/allset/posts/edit?slug=${encodeURIComponent(data.slug)}`)
      }, 1500)
    } catch (error) {
      console.error('Error creating post:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the post')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <Link
          href="/allset/posts"
          className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
        >
          Back to Posts
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <div className="flex">
            <div className="text-sm font-medium text-red-800 dark:text-red-400">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex">
            <div className="text-sm font-medium text-green-800 dark:text-green-400">{success}</div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-slate-100 p-6 shadow-md dark:bg-gray-800">
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is a placeholder for the new post creation form. In a real application, you would
            implement a form to create a new post.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            To create a new post, you would need to create a new MDX file in the{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 dark:bg-gray-700">data/blog</code>{' '}
            directory.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter post title"
              value={formData.title}
              onChange={handleTitleChange}
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="enter-post-slug"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="tag1, tag2, tag3"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="authors"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Authors (comma separated)
            </label>
            <input
              type="text"
              id="authors"
              name="authors"
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="author1, author2"
              value={formData.authors}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Enter a brief summary of the post"
              value={formData.summary}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 font-mono shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="# Your post content here\n\nWrite your post content in Markdown format."
              value={formData.content}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              id="draft"
              name="draft"
              type="checkbox"
              className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              checked={formData.draft}
              onChange={handleChange}
            />
            <label htmlFor="draft" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Save as draft
            </label>
          </div>

          {/* Content Generation Section */}
          <div className="mb-8 rounded-md border bg-gray-50 p-4 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Generate Content
            </h3>

            {/* Tabs */}
            <div className="mb-4 flex border-b">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'text' ? 'border-primary-500 text-primary-600 border-b-2' : 'text-gray-500'}`}
                onClick={() => setActiveTab('text')}
              >
                <div className="flex items-center">
                  <FiFileText className="mr-2" />
                  Text Input
                </div>
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'url' ? 'border-primary-500 text-primary-600 border-b-2' : 'text-gray-500'}`}
                onClick={() => setActiveTab('url')}
              >
                <div className="flex items-center">
                  <FiLink className="mr-2" />
                  URL
                </div>
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'pdf' ? 'border-primary-500 text-primary-600 border-b-2' : 'text-gray-500'}`}
                onClick={() => setActiveTab('pdf')}
              >
                <div className="flex items-center">
                  <FiUpload className="mr-2" />
                  PDF Upload
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-4">
              {activeTab === 'text' && (
                <div>
                  <textarea
                    className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={5}
                    placeholder="Paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div>
                  <input
                    type="url"
                    className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter website URL (e.g., https://example.com)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'pdf' && (
                <div>
                  <div className="flex w-full items-center justify-center">
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiUpload className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {pdfFile && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Selected file: {pdfFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div>
              <button
                type="button"
                className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
                onClick={() => {
                  if (activeTab === 'text') handleGenerateFromText()
                  else if (activeTab === 'url') handleGenerateFromUrl()
                  else if (activeTab === 'pdf') handleGenerateFromPdf()
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <FiRefreshCw className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </button>

              {generationError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{generationError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

// Main page component with Suspense boundary
export default function NewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <div className="border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-slate-300"></div>
        </div>
      }
    >
      <NewPostContent />
    </Suspense>
  )
}
