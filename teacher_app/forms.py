from django import forms
from auth_app.models import Teacher

class ImageForm(forms.Form):
    image = forms.ImageField(
        label='Choose a Picture',
        label_suffix='',
        widget=forms.FileInput(attrs={
            'class': 'image',
            'accept': 'image/*'  # Accept only image files
        })
    )

    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            # Check file size (2MB max)
            if image.size > 2 * 1024 * 1024:
                raise forms.ValidationError('Image size must be less than 2MB')
            
            # Check file type
            if not image.content_type.startswith('image/'):
                raise forms.ValidationError('Please upload a valid image file')
            
            return image
        return None