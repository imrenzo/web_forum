import React, { useState, useEffect } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

const Test: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedTag, setSelectedTag] = useState<number | null>(null);

    useEffect(() => {
        // Fetch categories and tags
        const fetchCategories = async () => {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        };

        const fetchTags = async () => {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
        };

        fetchCategories();
        fetchTags();
    }, []);

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(Number(event.target.value));
    };

    const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTag(Number(event.target.value));
    };

    return (
        <div>
            <h3>Filter Threads</h3>
            <div>
                <label>Category: </label>
                <select onChange={handleCategoryChange}>
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label>Tag: </label>
                <select onChange={handleTagChange}>
                    <option value="">Select Tag</option>
                    {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                            {tag.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Test;
