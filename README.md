# n8n-nodes-select-data

An n8n community node for visually selecting and cleaning data fields.

## Features

- **Visual Selection**: Select fields via dropdown from available input data
- **Include/Exclude Modes**: Keep only specific fields or remove unwanted ones
- **Rename Fields**: Select fields and give them new names
- **Nested Fields**: Support for dot notation (e.g. `user.address.city`)
- **Remove Empty Fields**: Automatically clean null/undefined/empty values

## Installation

### In n8n Community Nodes

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter: `@zurdai/n8n-nodes-select-data`
4. Accept the risks and install

### Manual (npm)

```bash
npm install @zurdai/n8n-nodes-select-data
```

## Usage

### Modes

#### 1. Include Fields
Select the fields that should appear in the output. All other fields will be removed.

**Example:**
- Input: `{ "name": "Max", "email": "max@test.com", "password": "secret", "age": 25 }`
- Selected: `name`, `email`
- Output: `{ "name": "Max", "email": "max@test.com" }`

#### 2. Exclude Fields
Select the fields that should be removed. All other fields will be kept.

**Example:**
- Input: `{ "name": "Max", "email": "max@test.com", "password": "secret" }`
- Excluded: `password`
- Output: `{ "name": "Max", "email": "max@test.com" }`

#### 3. Rename Fields
Select fields and give them new names.

**Example:**
- Input: `{ "firstName": "Max", "lastName": "Smith" }`
- Rename: `firstName` -> `first_name`, `lastName` -> `last_name`
- Output: `{ "first_name": "Max", "last_name": "Smith" }`

#### 4. Manual
Enter field names manually, separated by comma. Useful when fields don't appear in the dropdown.

### Options

| Option | Description |
|--------|-------------|
| **Remove Empty Fields** | Removes fields with `null`, `undefined` or empty strings |
| **Dot Notation** | Allows access to nested objects with `object.property.subproperty` |
| **Top Level Only** | Shows only top-level fields in the dropdown |

### Nested Fields

You can access nested fields using dot notation:

```json
// Input
{
  "user": {
    "name": "Max",
    "address": {
      "city": "Berlin",
      "zip": "10115"
    }
  },
  "meta": {
    "created": "2024-01-01"
  }
}

// With "user.name" and "user.address.city" selected:
{
  "user": {
    "name": "Max",
    "address": {
      "city": "Berlin"
    }
  }
}
```

## Typical Use Cases

1. **Clean API Data**: Remove sensitive or unnecessary fields before saving
2. **Simplify Data Structure**: Keep only relevant fields for subsequent nodes
3. **Standardize Fields**: Rename fields for consistent data structures
4. **Filter Webhook Payloads**: Remove unimportant data from incoming webhooks

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript (watch mode)
npm run dev

# Production build
npm run build

# Linting
npm run lint
npm run lintfix
```

## License

MIT
