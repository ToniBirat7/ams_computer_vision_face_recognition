from django import template

register = template.Library()

@register.filter
def get_id(value,id):
    print("We are inside the custom filter")
    print(id)
    return value[id]

@register.filter
def get_status(value,day):
    print("We are inside the custom second filter")
    print(value)
    print("\n")
    print(day)
    return value[day]


