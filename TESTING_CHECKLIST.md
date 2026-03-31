# Testing and Deployment Checklist

## Pre-Deployment Testing

### Backend Setup ✓

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed from requirements.txt
- [ ] .env file created with credentials:
  - [ ] hf_token (Hugging Face API token)
  - [ ] REPLICATE_MODEL_NAME (e.g., "model-owner/model-name")
- [ ] Database configured
- [ ] Backend starts without errors: `uvicorn app.main:app --reload`
- [ ] Health check passes: `curl http://localhost:8000/api/health`

### Frontend Setup ✓

- [ ] Node.js 16+ installed
- [ ] Dependencies installed: `npm install`
- [ ] API_BASE_URL configured correctly in `transformationAPI.ts`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] No TypeScript errors in console

### Both Running ✓

- [ ] Backend on http://localhost:8000
- [ ] Frontend on http://localhost:5173 (or shown in console)
- [ ] No CORS errors in browser console

## Feature Testing

### Image Upload

- [ ] Can click upload button
- [ ] File picker opens
- [ ] Can select JPG image
- [ ] Can select PNG image
- [ ] Preview displays after selection
- [ ] Validation: Rejects non-image files (shows alert)
- [ ] Validation: Rejects files > 5MB (shows alert)
- [ ] Can remove uploaded image with X button
- [ ] Upload box clears when image is removed

### Options Selection

- [ ] Room type dropdown works
- [ ] Can select different room types
- [ ] Room type updates in state
- [ ] Style cards display correctly
- [ ] Can click style cards to select
- [ ] Selected style is highlighted/tracked
- [ ] Can change selection multiple times

### Generate Button

- [ ] Button is enabled with uploaded image
- [ ] Button is clickable
- [ ] Text changes to "Generating..." on click
- [ ] Button becomes disabled during processing
- [ ] Button opacity changes (visual feedback)
- [ ] Button is re-enabled after processing completes

### Processing

- [ ] API request is sent to correct endpoint
- [ ] Request includes:
  - [ ] image_file (multipart form)
  - [ ] room_type (lowercased)
  - [ ] style_name (lowercased)
- [ ] Request takes 30-60 seconds (Replicate processing)
- [ ] No console errors during processing
- [ ] Network tab shows successful POST request

### Generated Image Display

- [ ] Generated image section appears after processing
- [ ] Image displays correctly
- [ ] Image is properly formatted and sized
- [ ] "Generated Image" title is visible
- [ ] Image has proper styling (shadow, rounded corners)
- [ ] Can scroll to view full image

### Error Handling

- [ ] Error displays if file not uploaded when generating
- [ ] Error displays if backend is unavailable
- [ ] Error displays if Replicate API fails
- [ ] Error message is user-friendly and red
- [ ] Can retry after error
- [ ] Error clears when action is successful

### Multiple Transformations

- [ ] Can generate multiple transformations
- [ ] Previous image clears when generating new one
- [ ] Can test different room types
- [ ] Can test different styles
- [ ] Each transformation creates new database record
- [ ] API handles rapid requests

## API Testing

### POST /api/transformations/

#### Test 1: Valid Request

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "room_type=bedroom" \
  -F "style_name=minimalist"
```

- [ ] Returns 200 status code
- [ ] Response includes:
  - [ ] transformation_id (UUID)
  - [ ] room_type (string)
  - [ ] style_name (string)
  - [ ] output_image_url (valid URL)
- [ ] Database record created
- [ ] Output URL is accessible

#### Test 2: Missing Image File

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "room_type=bedroom" \
  -F "style_name=minimalist"
```

- [ ] Returns error status code (422)
- [ ] Error message indicates missing field

#### Test 3: Missing Room Type

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "style_name=minimalist"
```

- [ ] Returns error status code (422)
- [ ] Error message indicates missing field

#### Test 4: Missing Style Name

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "room_type=bedroom"
```

- [ ] Returns error status code (422)
- [ ] Error message indicates missing field

#### Test 5: Invalid Room Type Format

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "room_type=BEDROOM" \
  -F "style_name=MINIMALIST"
```

- [ ] Works correctly (converted to lowercase)
- [ ] Returns 200 status code
- [ ] Database record has lowercase values

#### Test 6: Optional Fields

```bash
curl -X POST http://localhost:8000/api/transformations/ \
  -F "image_file=@/path/to/image.jpg" \
  -F "room_type=bedroom" \
  -F "style_name=minimalist" \
  -F "project_id=123e4567-e89b-12d3-a456-426614174000"
```

- [ ] Returns 200 status code
- [ ] project_id is stored in database
- [ ] Response includes project_id

#### Test 7: Invalid File Type

- [ ] Upload .txt file (should reject)
- [ ] Upload .pdf file (should reject)
- [ ] Upload corrupted JPG (should handle gracefully)

#### Test 8: Large File (> 5MB)

- [ ] Frontend validation shows alert before sending
- [ ] File is not sent to backend

## Database Testing

### Transformation Records

- [ ] Records are created for each transformation
- [ ] transformation_id is unique UUID
- [ ] room_type is stored correctly
- [ ] style_name is stored correctly
- [ ] project_id is NULL when not provided
- [ ] input_image_id is NULL when not provided
- [ ] created_at timestamp is set
- [ ] All records queryable from database

### Relationships

- [ ] Can query transformations by project
- [ ] Can query transformations by style
- [ ] Can query transformations by room type
- [ ] Can count transformations per project

## Browser Console Testing

### No Errors

- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] No TypeScript errors
- [ ] No network errors (404, 500, etc.)
- [ ] No console warnings

### Network Tab

- [ ] POST request shows correct endpoint
- [ ] Request headers include Content-Type: multipart/form-data
- [ ] Response status is 200
- [ ] Response contains JSON with output_image_url

## Performance Testing

### Response Time

- [ ] Frontend handles 30-60 second wait gracefully
- [ ] UI remains responsive during processing
- [ ] Loading state accurately reflects progress
- [ ] No timeout errors during normal processing

### Image Quality

- [ ] Generated image is high quality
- [ ] Image displays properly in browser
- [ ] Image doesn't appear stretched or distorted
- [ ] Image loads from external URL without issues

## Dark Mode Testing

- [ ] Upload box styled correctly in dark mode
- [ ] Form inputs visible in dark mode
- [ ] Error message visible in dark mode
- [ ] Generated image section styled correctly in dark mode
- [ ] All text readable in dark mode

## Responsive Testing

- [ ] Desktop (1920x1080) - All elements visible
- [ ] Tablet (768px) - Layout adapts
- [ ] Mobile (375px) - Stacks properly
- [ ] Upload box responsive
- [ ] Generated image section responsive
- [ ] Button clickable on all screen sizes

## Production Deployment Checklist

### Backend Deployment

- [ ] Update CORS allowed_origins to frontend domain
- [ ] Update database to production database
- [ ] Set DEBUG = False
- [ ] Use environment variables for all secrets
- [ ] Setup HTTPS/SSL
- [ ] Configure logging
- [ ] Setup monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Add rate limiting
- [ ] Setup CDN for image delivery (optional)
- [ ] Test all endpoints on production

### Frontend Deployment

- [ ] Build production bundle: `npm run build`
- [ ] Update API_BASE_URL to production backend
- [ ] Test all features on production
- [ ] Setup analytics (optional)
- [ ] Setup error monitoring (Sentry, LogRocket)
- [ ] Test on multiple browsers
- [ ] Test on multiple devices
- [ ] Verify HTTPS works correctly
- [ ] Check performance with tools (Lighthouse, GTmetrix)

## Monitoring Post-Deployment

### Backend Monitoring

- [ ] Monitor API response times
- [ ] Monitor Replicate API usage/costs
- [ ] Monitor database size
- [ ] Monitor error rates
- [ ] Setup alerts for errors
- [ ] Monitor server resource usage
- [ ] Track transformation success rate

### Frontend Monitoring

- [ ] Monitor page load times
- [ ] Monitor error rates
- [ ] Monitor user interactions
- [ ] Setup crash reporting
- [ ] Monitor API call duration
- [ ] Track user sessions

## Documentation Verification

- [ ] INTEGRATION_GUIDE.md is accurate
- [ ] SETUP_GUIDE.md has correct instructions
- [ ] FLOW_DIAGRAM.md reflects current implementation
- [ ] QUICK_REFERENCE.md is helpful
- [ ] CODE_SNIPPETS.md contains working examples
- [ ] README.md is updated with new features

## Security Checklist

- [ ] File uploads validated (type, size)
- [ ] Input sanitization on room_type and style_name
- [ ] No sensitive data logged
- [ ] HTTPS enforced in production
- [ ] Database credentials in environment variables
- [ ] API keys in environment variables
- [ ] CORS properly configured for production
- [ ] Rate limiting enabled (optional)
- [ ] SQL injection prevention (using ORM)
- [ ] File upload size limits enforced

## Rollback Plan

If deployment fails:

1. [ ] Database backup exists
2. [ ] Can revert backend code
3. [ ] Can revert frontend code
4. [ ] Previous version can be deployed quickly
5. [ ] Users notified of issues

## Final Sign-Off

- [ ] All tests passed
- [ ] No blockers remain
- [ ] Documentation complete
- [ ] Team trained on features
- [ ] Ready for production
- [ ] Monitoring configured
- [ ] Backup plan ready

---

**Tester Name:** ********\_\_\_\_********
**Date:** ********\_\_\_\_********
**Status:** ✓ APPROVED / ☐ NEEDS FIXES
**Notes:** ********\_\_\_\_********
